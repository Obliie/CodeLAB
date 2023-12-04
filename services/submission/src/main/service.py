from concurrent import futures
import logging
import os
import base64
from typing import List

from threading import Thread
import grpc
from google.protobuf import json_format
from bson.objectid import ObjectId

from protobufs.common.v1 import problem_pb2, solution_pb2, language_pb2
from protobufs.services.v1 import submission_service_pb2, submission_service_pb2_grpc
from protobufs.services.v1 import problem_service_pb2, problem_service_pb2_grpc
from protobufs.services.v1 import code_runner_service_pb2, code_runner_service_pb2_grpc

from common.config import Config
from common.service_logging import init_logging, log_and_flush
from pymongo import MongoClient

DATABASE_USERNAME_FILE = "/run/secrets/submissiondb-root-username"
DATABASE_PASSWORD_FILE = "/run/secrets/submissiondb-root-password"

SUBMISSIONS_COLLECTION_NAME = "submissions"

class SubmissionServicer(submission_service_pb2_grpc.SubmissionService):
    DATABASE_HOST = Config.CONFIG["services"]["submission"]["database"]["host"]
    DATABASE_PORT = Config.CONFIG["services"]["submission"]["database"]["port"]
    DATABASE_NAME = Config.CONFIG["services"]["submission"]["database"]["name"]

    def __init__(self):
        with open(DATABASE_USERNAME_FILE) as database_username_file, open(
            DATABASE_PASSWORD_FILE
        ) as database_password_file:
            self.client = MongoClient(
                f"mongodb://{database_username_file.read()}:{database_password_file.read()}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}?authSource=admin"
            )
            log_and_flush(logging.INFO, f"MongoDB client created...")

    def _query_id(self, problem_id: str) -> ObjectId:
        return ObjectId(problem_id)

    def _create_submission(self, user_id: str, problem_id: str, submission_files: List[solution_pb2.SolutionFile]):
        result = (
            self.client[self.DATABASE_NAME]
            .get_collection(SUBMISSIONS_COLLECTION_NAME)
            .insert_one({
                "user_id": user_id,
                "problem_id": problem_id,
                "files": [
                    {
                        "entry": submission_file.entry,
                        "path": submission_file.path,
                        "data": base64.b64encode(submission_file.data),
                        "tests": []
                    }
                    for submission_file in submission_files
                ]
            })
        )

        return result.inserted_id

    def _save_test_result(self, submission_id: str, test_result_response: code_runner_service_pb2.RunCodeTestsResponse):
        log_and_flush(logging.INFO, f"Saving result for test {str(test_result_response.test_id)}")
        result = (
            self.client[self.DATABASE_NAME]
            .get_collection(SUBMISSIONS_COLLECTION_NAME)
            .update_one(
                {"_id": self._query_id(submission_id)},
                {"$push": {"tests": {"$each": [dict(json_format.MessageToDict(test_result_response), **{"success": test_result_response.success})]}}},
            )
        )
        return
    
    def _send_test_result_event(self, submission_id: str, test_result_response: code_runner_service_pb2.RunCodeTestsResponse):
        return
    
    def _save_code_runner_responses(self, submission_id: str, tests: List[problem_pb2.Problem.TestData], files: List[solution_pb2.SolutionFile]):
        with grpc.insecure_channel(f"code-runner:{ os.environ['CODE_RUNNER_SERVICE_PORT' ]}") as channel:
            stub = code_runner_service_pb2_grpc.CodeRunnerServiceStub(channel)

            for test_result_response in stub.RunCodeTests(
                code_runner_service_pb2.RunCodeTestsRequest(
                    tests=tests, files=files, language=language_pb2.PROGRAMMING_LANGUAGE_PYTHON, has_dependencies=False
                )
            ):
                log_and_flush(logging.INFO, f"Got data from code runner...")
                self._save_test_result(submission_id, test_result_response)
                self._send_test_result_event(submission_id, test_result_response)

    def SubmitCode(self,
        request: submission_service_pb2.SubmitCodeRequest,
        context: grpc.ServicerContext,
    ) -> submission_service_pb2.SubmitCodeResponse:
        with grpc.insecure_channel(f"problem:{ os.environ['PROBLEM_SERVICE_PORT' ]}") as channel:
            stub = problem_service_pb2_grpc.ProblemServiceStub(channel)

            problem_response = stub.GetProblem(problem_service_pb2.GetProblemRequest(problem_id=request.problem_id))
        
        submission_id = self._create_submission(user_id=request.user_id, problem_id=problem_response.problem.id, submission_files=request.files)
        log_and_flush(logging.INFO, f"Created submission {str(submission_id)}")

        thread = Thread(target=self._save_code_runner_responses, args=(submission_id, problem_response.problem.tests, request.files))
        thread.start()

        resp = submission_service_pb2.SubmitCodeResponse()
        resp.submission_id = str(submission_id)

        return resp

    def GetSubmission(self,
        request: submission_service_pb2.GetSubmissionRequest,
        context: grpc.ServicerContext,
    ) -> submission_service_pb2.GetSubmissionResponse:
        log_and_flush(logging.INFO, f"Trying to get submission {str(request.submission_id)}")
        submission_document = (
            self.client[self.DATABASE_NAME]
            .get_collection(SUBMISSIONS_COLLECTION_NAME)
            .find_one({"_id": self._query_id(request.submission_id)})
        )

        log_and_flush(logging.INFO, f"Got submission {str(request.submission_id)}")

        resp = submission_service_pb2.GetSubmissionResponse()
        resp.problem_id = submission_document["problem_id"]
        resp.user_id = submission_document["user_id"]
        resp.submission_no = "NAN"
        for test in submission_document["tests"]:
            if "testId" in test.keys():
                test_result = submission_service_pb2.SubmissionTestResult()
                test_result.test_id = test["testId"]
                test_result.passed = test["success"]
                test_result.output = test["stdout"]
                resp.test_results.append(test_result)

        return resp

    def GetUserSubmissions(self,
        request: submission_service_pb2.GetUserSubmissionsRequest,
        context: grpc.ServicerContext,
    ) -> submission_service_pb2.GetUserSubmissionsResponse:
        submissions = (
            self.client[self.DATABASE_NAME]
            .get_collection(SUBMISSIONS_COLLECTION_NAME)
            .find({"user_id": request.user_id})
        )

        resp = submission_service_pb2.GetUserSubmissionsResponse()
        for submission in submissions:
            resp.submission_id.append(str(submission["_id"]))

        return resp

    def GetProblemSubmissions(self,
        request: submission_service_pb2.GetProblemSubmissionsRequest,
        context: grpc.ServicerContext,
    ) -> submission_service_pb2.GetProblemSubmissionsResponse:
        return


def serve() -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    submission_service_pb2_grpc.add_SubmissionServiceServicer_to_server(
        SubmissionServicer(), server
    )
    server.add_insecure_port(f"[::]:{ os.environ['SUBMISSION_SERVICE_PORT'] }")
    log_and_flush(logging.INFO, "Starting Submission service...")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    init_logging()
    serve()
