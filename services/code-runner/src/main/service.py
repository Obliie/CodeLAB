"""A service to compile and run arbitary code which is provided in a secure containerized environment."""
from concurrent import futures
import logging
import os
from typing import Any, Dict
import yaml

import grpc
from protobufs.services.v1 import code_runner_service_pb2, code_runner_service_pb2_grpc
from protobufs.common.v1 import language_pb2

from common.config import Config
from container_controller import ContainerController
from common.service_logging import init_logging, log_and_flush
from runners.series_test_runner import SeriesTestRunner

from runners.test_runner import BaseTestRunner


class CodeRunnerServicer(code_runner_service_pb2_grpc.CodeRunnerService):
    def __init__(self, container_controller: ContainerController, languages_config: Dict[Any, Any]):
        self.container_controller = container_controller
        self.languages_config = languages_config

    def GetRunnerState(
        self,
        request: code_runner_service_pb2.GetRunnerStateRequest,
        context: grpc.ServicerContext,
    ) -> code_runner_service_pb2.GetRunnerStateResponse:
        resp = code_runner_service_pb2.GetRunnerStateResponse()

        return resp

    # TODO UPDATE WITH response similar to RunCodeTests response message
    def RunCode(
        self,
        request: code_runner_service_pb2.RunCodeRequest,
        context: grpc.ServicerContext,
    ) -> code_runner_service_pb2.RunCodeResponse:
        resp = code_runner_service_pb2.RunCodeResponse()

        resp.stage = code_runner_service_pb2.RunStage.RUN_STAGE_COMPILE
        resp.stdout = "RunCode received submission"
        resp.stderr = ""
        yield resp

        with BaseTestRunner(self.container_controller, request.files) as runner:
            runner.setup()
            out = runner.run_tests()

            resp.stage = code_runner_service_pb2.RunStage.RUN_STAGE_EXECUTE
            resp.stdout = out
            resp.stderr = ""

            yield resp

        resp.stage = code_runner_service_pb2.RunStage.RUN_STAGE_EXECUTE
        resp.stdout = "RunCode execution complete"
        resp.stderr = ""
        yield resp

    def RunCodeTests(
        self,
        request: code_runner_service_pb2.RunCodeTestsRequest,
        context: grpc.ServicerContext,
    ) -> code_runner_service_pb2.RunCodeTestsResponse:
        resp = code_runner_service_pb2.RunCodeTestsResponse()

        language_config = self.languages_config[language_pb2.ProgrammingLanguage.Name(request.language)]
        with SeriesTestRunner(self.container_controller, request.files, request.tests, language_config) as runner:
            runner.setup()
            log_and_flush(logging.INFO, f"Got {len(request.tests)} to run")
            for test_id, result, success, run_time in runner.run_tests():
                log_and_flush(logging.INFO, f"Run for test {test_id} complete")
                resp.test_id = test_id
                resp.stage = code_runner_service_pb2.RunStage.RUN_STAGE_EXECUTE
                resp.stdout = result
                resp.stderr = ""
                resp.success = success

                yield resp


def serve() -> None:
    languages_config = Config.CONFIG["services"]["code-runner"]["languages"]

    with ContainerController(
        storage_path=Config.CONFIG["services"]["code-runner"]["container-files"],
        language_config=languages_config,
    ) as container_controller:
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        code_runner_service_pb2_grpc.add_CodeRunnerServiceServicer_to_server(
            CodeRunnerServicer(container_controller, languages_config), server
        )
        server.add_insecure_port(f"[::]:{ os.environ['CODE_RUNNER_SERVICE_PORT'] }")
        log_and_flush(logging.INFO, "Starting Code Runner service...")
        server.start()
        server.wait_for_termination()


if __name__ == "__main__":
    init_logging()
    serve()
