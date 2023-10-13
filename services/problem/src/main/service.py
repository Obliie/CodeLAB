"""A service to handle the persistence of "problems" and their submitted solutions with any evaluated scores."""
from concurrent import futures
import logging
import os

import grpc
from protobufs.services.v1 import problem_service_pb2, problem_service_pb2_grpc

from service_logging import init_logging, log_and_flush


class ProblemServicer(problem_service_pb2_grpc.ProblemService):
    def GetProblemById(
        self, request: problem_service_pb2.GetProblemRequest, context: grpc.ServicerContext
    ) -> problem_service_pb2.GetProblemResponse:
        problem = problem_service_pb2.Problem()
        problem.title = "Hi I'm here for testing :)"
        problem.description = "blah blah"

        testData1 = problem_service_pb2.TestData()
        testData1.input = "01"
        testData1.expectedOutput = "out1"

        testData2 = problem_service_pb2.TestData()
        testData2.input = "02"
        testData2.expectedOutput = "out2"

        problem.testData.append(testData1)
        problem.testData.append(testData2)

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
