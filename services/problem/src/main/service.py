"""A service to handle the persistence of "problems" and their submitted solutions with any evaluated scores."""
from concurrent import futures
import logging
import os

import grpc
from protobufs.services.v1 import problem_service_pb2, problem_service_pb2_grpc
from protobufs.common.v1 import problem_pb2

from config import Config
from service_logging import init_logging, log_and_flush
from pymongo import MongoClient

DATABASE_USERNAME_FILE = "/run/secrets/mongo-username"
DATABASE_PASSWORD_FILE = "/run/secrets/mongo-password"


class ProblemServicer(problem_service_pb2_grpc.ProblemService):
    DATABASE_HOST = Config.CONFIG["services"]["problem"]["database"]["host"]
    DATABASE_PORT = Config.CONFIG["services"]["problem"]["database"]["port"]
    DATABASE_NAME = Config.CONFIG["services"]["problem"]["database"]["name"]

    def __init__(self):
        with open(DATABASE_USERNAME_FILE) as database_username_file, open(
            DATABASE_PASSWORD_FILE
        ) as database_password_file:
            self.client = MongoClient(
                f"mongodb://{database_username_file.read()}:{database_password_file.read()}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            )
            log_and_flush(logging.INFO, f"db connected to {self.client.get_database().name}")

    def GetProblemSummaries(
        self, request: problem_service_pb2.GetProblemSummariesRequest, context: grpc.ServicerContext
    ) -> problem_service_pb2.GetProblemSummariesResponse:
        problem22 = problem_pb2.ProblemSummary()
        problem22.id = "11"
        problem22.title = "Programming Lab Environment"
        problem22.summary = "This is a summary of the task..."

        problem = problem_pb2.ProblemSummary()
        problem.id = "12"
        problem.title = "Hi I'm here for testing :)"
        problem.summary = "blah blah"

        problem2 = problem_pb2.ProblemSummary()
        problem2.id = "13"
        problem2.title = "Hi I'm here for testing also :)"
        problem2.summary = "blah blah NYASH"

        resp = problem_service_pb2.GetProblemSummariesResponse()
        resp.problem_summaries.append(problem22)
        resp.problem_summaries.append(problem)
        resp.problem_summaries.append(problem2)

        return resp

    def GetProblem(
        self, request: problem_service_pb2.GetProblemRequest, context: grpc.ServicerContext
    ) -> problem_service_pb2.GetProblemResponse:
        problem = problem_pb2.Problem()
        problem.id = "11"
        problem.title = "Programming Lab Environment"
        problem.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Varius duis at consectetur lorem donec. In ante metus dictum at tempor commodo ullamcorper a. Nulla facilisi etiam dignissim diam quis enim lobortis. Sapien eget mi proin sed libero. In pellentesque massa placerat duis ultricies lacus. Semper viverra nam libero justo laoreet sit amet cursus. Fames ac turpis egestas sed tempus. Vitae semper quis lectus nulla at volutpat diam ut venenatis. Urna nunc id cursus metus aliquam. Aliquet eget sit amet tellus cras adipiscing enim. Sit amet nisl suscipit adipiscing bibendum est ultricies. Odio facilisis mauris sit amet massa vitae tortor condimentum. Dictumst quisque sagittis purus sit amet volutpat consequat mauris. Diam maecenas ultricies mi eget mauris pharetra et ultrices neque. \n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Varius duis at consectetur lorem donec. In ante metus dictum at tempor commodo ullamcorper a. Nulla facilisi etiam dignissim diam quis enim lobortis. Sapien eget mi proin sed libero. In pellentesque massa placerat duis ultricies lacus. Semper viverra nam libero justo laoreet sit amet cursus. Fames ac turpis egestas sed tempus. Vitae semper quis lectus nulla at volutpat diam ut venenatis. Urna nunc id cursus metus aliquam. Aliquet eget sit amet tellus cras adipiscing enim. Sit amet nisl suscipit adipiscing bibendum est ultricies. Odio facilisis mauris sit amet massa vitae tortor condimentum. Dictumst quisque sagittis purus sit amet volutpat consequat mauris. Diam maecenas ultricies mi eget mauris pharetra et ultrices neque."

        testData1 = problem_pb2.Problem.TestData()
        testInput = problem_pb2.Problem.TestInput()
        testInput.arg_position = 1
        testInput.input_value = "python"
        testData1.inputs.append(testInput)
        testInput4 = problem_pb2.Problem.TestInput()
        testInput4.arg_position = 2
        testInput4.input_value = "-d 39"
        testData1.inputs.append(testInput4)
        testData1.expected_stdout = "Hello python!"

        testData2 = problem_pb2.Problem.TestData()
        testInput2 = problem_pb2.Problem.TestInput()
        testInput2.arg_position = 1
        testInput2.input_value = "c++"
        testData2.inputs.append(testInput2)
        testData2.expected_stdout = "Hello c++!"

        problem.test_data.append(testData1)
        problem.test_data.append(testData2)

        resp = problem_service_pb2.GetProblemResponse()
        resp.problem.CopyFrom(problem)

        return resp


def serve() -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    problem_service_pb2_grpc.add_ProblemServiceServicer_to_server(ProblemServicer(), server)
    server.add_insecure_port(f"[::]:{ os.environ['PROBLEM_SERVICE_PORT'] }")
    log_and_flush(logging.INFO, "Starting Probelm service...")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    init_logging()
    serve()
