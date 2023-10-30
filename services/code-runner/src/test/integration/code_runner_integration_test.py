"""Integration tests for the code runner service."""

import grpc
import os

from protobufs.services.v1 import code_runner_service_pb2, code_runner_service_pb2_grpc
from protobufs.common.v1 import solution_pb2, language_pb2


def test_run_code() -> None:
    with grpc.insecure_channel(f"code-runner:{ os.environ['CODE_RUNNER_SERVICE_PORT' ]}") as channel:
        stub = code_runner_service_pb2_grpc.CodeRunnerServiceStub(channel)

        solution_file: solution_pb2.SolutionFile = solution_pb2.SolutionFile(
            type=solution_pb2.SolutionFileType.FILE_TYPE_SINGLE,
            main_file=True,
            path="main.py",
            data=b"""# Integration test file
print('Hello from integration testing')
            """
        )

        for response in stub.RunCode(code_runner_service_pb2.RunCodeRequest(
            files=[solution_file],
            language=language_pb2.PROGRAMMING_LANGUAGE_PYTHON,
            has_dependencies=False
        )):
            assert response.stdout is not None
            assert response.stdout is not ""
