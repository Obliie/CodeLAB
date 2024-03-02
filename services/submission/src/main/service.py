from concurrent import futures
import datetime
import logging
import os
import base64
import time
from typing import List

from threading import Thread
import grpc
from google.protobuf import json_format
from bson.objectid import ObjectId

from google.protobuf.timestamp_pb2 import Timestamp
from protobufs.common.v1 import problem_pb2, solution_pb2, language_pb2, status_pb2
from protobufs.services.v1 import submission_service_pb2, submission_service_pb2_grpc
from protobufs.services.v1 import problem_service_pb2, problem_service_pb2_grpc
from protobufs.services.v1 import code_runner_service_pb2, code_runner_service_pb2_grpc
from protobufs.services.v1 import status_service_pb2, status_service_pb2_grpc

from common.config import Config
from common.service_logging import init_logging, log_and_flush
from pymongo import MongoClient
from google.protobuf import json_format

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

    def _create_submission(self, user_id: str, problem_id: str, submission_files: List[solution_pb2.SolutionFile], language: language_pb2.ProgrammingLanguage):
        result = (
            self.client[self.DATABASE_NAME]
            .get_collection(SUBMISSIONS_COLLECTION_NAME)
            .insert_one({
                "user_id": user_id,
                "problem_id": problem_id,
                "language": language,
                "files": [
                    {
                        "entry": submission_file.entry,
                        "path": submission_file.path,
                        "data": base64.b64encode(submission_file.data),
                    }
                    for submission_file in submission_files
                ],
                "tests": [],
                "submission_time": datetime.datetime.utcnow().isoformat()
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
        with grpc.insecure_channel(f"status:{ os.environ['STATUS_SERVICE_PORT' ]}") as channel:
            stub = status_service_pb2_grpc.StatusServiceStub(channel)
            event = submission_service_pb2.SubmissionStatusEvent(state=status_pb2.SubmissionStatus.SUBMISSION_STATUS_EXECUTING)
            result = submission_service_pb2.SubmissionTestResult()
            result.test_id = test_result_response.test_id
            result.passed = test_result_response.success
            result.output = test_result_response.stdout
            result.runtime = test_result_response.runtime
            event.result.CopyFrom(result)

            event_string = json_format.MessageToJson(event)

            stub.PostStatusEvent(status_service_pb2.PostStatusEventRequest(event_group=f"{submission_id}", data=event_string))
        
        return
    
    def _send_status_update_event(self, submission_id: str, status: status_pb2.SubmissionStatus):
        with grpc.insecure_channel(f"status:{ os.environ['STATUS_SERVICE_PORT' ]}") as channel:
            stub = status_service_pb2_grpc.StatusServiceStub(channel)
            event = submission_service_pb2.SubmissionStatusEvent(state=status)

            event_string = json_format.MessageToJson(event)

            stub.PostStatusEvent(status_service_pb2.PostStatusEventRequest(event_group=f"{submission_id}", data=event_string))
        
        return

    def _signal_event_stream_end(self, submission_id: str):
        with grpc.insecure_channel(f"status:{ os.environ['STATUS_SERVICE_PORT' ]}") as channel:
            stub = status_service_pb2_grpc.StatusServiceStub(channel)
            stub.PostStatusEvent(status_service_pb2.PostStatusEventRequest(event_group=f"{submission_id}", data="end"))
        
        return

    def _save_code_runner_responses(self, submission_id: str, problem: problem_pb2.Problem, language: language_pb2.ProgrammingLanguage, files: List[solution_pb2.SolutionFile]):
        time.sleep(1)
        self._send_status_update_event(submission_id, status_pb2.SUBMISSION_STATUS_RECEIVED)

        with grpc.insecure_channel(f"code-runner:{ os.environ['CODE_RUNNER_SERVICE_PORT' ]}") as channel:
            failed = False
            stub = code_runner_service_pb2_grpc.CodeRunnerServiceStub(channel)

            for test_result_response in stub.RunCodeTests(
                code_runner_service_pb2.RunCodeTestsRequest(
                    tests=problem.tests, files=files, language=language, has_dependencies=False, run_timeout=problem.run_timeout, run_max_memory=problem.run_max_memory
                )
            ):
                log_and_flush(logging.INFO, f"Got data from code runner...")
                if test_result_response.timeout:
                    failed = True
                    self._send_status_update_event(submission_id, status_pb2.SUBMISSION_STATUS_COMPLETE_TIMEOUT)
                    break

                self._save_test_result(submission_id, test_result_response)
                self._send_test_result_event(submission_id, test_result_response)
                if not test_result_response.success:
                    failed = True

            if failed:
                log_and_flush(logging.INFO, "SENDING SUBMISSION_STATUS_COMPLETE_FAIL")
                self._send_status_update_event(submission_id, status_pb2.SUBMISSION_STATUS_COMPLETE_FAIL)
            else:
                log_and_flush(logging.INFO, "SENDING SUBMISSION_STATUS_COMPLETE_PASS")
                self._send_status_update_event(submission_id, status_pb2.SUBMISSION_STATUS_COMPLETE_PASS)

            self._signal_event_stream_end(submission_id)


    def SubmitCode(self,
        request: submission_service_pb2.SubmitCodeRequest,
        context: grpc.ServicerContext,
    ) -> submission_service_pb2.SubmitCodeResponse:
        with grpc.insecure_channel(f"problem:{ os.environ['PROBLEM_SERVICE_PORT' ]}") as channel:
            stub = problem_service_pb2_grpc.ProblemServiceStub(channel)

            problem_response = stub.GetProblem(problem_service_pb2.GetProblemRequest(problem_id=request.problem_id))
        
        submission_id = self._create_submission(user_id=request.user_id, problem_id=problem_response.problem.id, submission_files=request.files, language=request.language)

        thread = Thread(target=self._save_code_runner_responses, args=(submission_id, problem_response.problem, request.language, request.files))
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
        resp.submission_id = str(submission_document["_id"])
        if "tests" in submission_document.keys():
            for test in submission_document["tests"]:
                if "testId" in test.keys():
                    test_result = submission_service_pb2.SubmissionTestResult()
                    test_result.test_id = test["testId"]
                    test_result.passed = test["success"]
                    if "stdout" in test:
                        test_result.output = test["stdout"]
                    else:
                        test_result.output = ""
                    if "runtime" in test:
                        test_result.runtime = test["runtime"]
                    
                    resp.test_results.append(test_result)

        resp.language = submission_document["language"]
        if "files" in submission_document.keys():
            for file in submission_document["files"]:
                solution_file = solution_pb2.SolutionFile()
                solution_file.entry = file["entry"]
                solution_file.path = file["path"]
                solution_file.data = file["data"]
                    
                resp.files.append(solution_file)

        submission_time = Timestamp()
        submission_time.FromDatetime(datetime.datetime.fromisoformat(submission_document["submission_time"]))
        resp.submission_time.CopyFrom(submission_time)

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
        submissions = (
            self.client[self.DATABASE_NAME]
            .get_collection(SUBMISSIONS_COLLECTION_NAME)
            .find({"problem_id": request.problem_id})
        )

        resp = submission_service_pb2.GetProblemSubmissionsResponse()
        for submission in submissions:
            resp.submission_id.append(str(submission["_id"]))

        return resp


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
