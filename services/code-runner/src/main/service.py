"""A service to compile and run arbitary code which is provided in a secure containerized environment."""
from concurrent import futures
import logging
import os
import yaml

import grpc
from protobufs.services.v1 import code_runner_service_pb2, code_runner_service_pb2_grpc

from config import Config
from container_controller import ContainerController
from service_logging import init_logging, log_and_flush

from runners.test_runner import BaseTestRunner


class CodeRunnerServicer(code_runner_service_pb2_grpc.CodeRunnerService):
    def __init__(self, container_controller: ContainerController):
        self.container_controller = container_controller

    def GetRunnerState(
        self, request: code_runner_service_pb2.GetRunnerStateRequest, context: grpc.ServicerContext
    ) -> code_runner_service_pb2.GetRunnerStateResponse:
        resp = code_runner_service_pb2.GetRunnerStateResponse()

        return resp

    def RunCode(
        self, request: code_runner_service_pb2.RunCodeRequest, context: grpc.ServicerContext
    ) -> code_runner_service_pb2.RunCodeResponse:
        resp = code_runner_service_pb2.RunCodeResponse()

        out = "FAIL RUN"
        with BaseTestRunner(self.container_controller, request.files) as runner:
            out = runner.run_tests()

        # yield
        resp.stage = code_runner_service_pb2.RunStage.RUN_STAGE_EXECUTE
        resp.stdout = out
        resp.stderr = ""

        yield resp


def serve() -> None:
    with ContainerController(
        storage_path=Config.CONFIG["services"]["code-runner"]["container-files"],
        language_config=Config.CONFIG["services"]["code-runner"]["languages"],
    ) as container_controller:
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        code_runner_service_pb2_grpc.add_CodeRunnerServiceServicer_to_server(
            CodeRunnerServicer(container_controller), server
        )
        server.add_insecure_port(f"[::]:{ os.environ['CODE_RUNNER_SERVICE_PORT'] }")
        log_and_flush(logging.INFO, "Starting Code Runner service...")
        server.start()
        server.wait_for_termination()


if __name__ == "__main__":
    init_logging()
    serve()
