"""Integration tests for the problem service."""
import os

import grpc
from protobufs.services.v1 import problem_service_pb2, problem_service_pb2_grpc


def test_get_problem() -> None:
    with grpc.insecure_channel(f"problem:{ os.environ['PROBLEM_SERVICE_PORT' ]}") as channel:
        stub = problem_service_pb2_grpc.ProblemServiceStub(channel)

        response = stub.GetProblem(problem_service_pb2.GetProblemRequest(problem_id="2"))

        assert response.problem.title == "Programming Lab Environment"
