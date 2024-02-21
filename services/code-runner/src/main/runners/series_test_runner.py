import time
import logging
from typing import Any, Dict, Generator, List
from protobufs.common.v1 import language_pb2, solution_pb2
from container_controller import ContainerController
from docker.models.containers import Container

from common.service_logging import log_and_flush
from protobufs.common.v1 import problem_pb2
from runners.test_runner import BaseTestRunner


class SeriesTestRunner(BaseTestRunner):

    def __init__(self, container_controller: ContainerController, solution_files: List[solution_pb2.SolutionFile], tests: problem_pb2.Problem.TestData, config: Dict[Any, Any]):
        super(SeriesTestRunner, self).__init__(container_controller, solution_files, config)
        self.tests = tests
        self.config = config

    def run_tests(self) -> Any:
        for test in self.tests:
            container: Container = self.container_controller._get_container(self.container_id)
            command = self.config["run-command"].format(FILE=f"{self.DEFAULT_STORAGE_PATH}/{self.config['main-file']}", ARGS=test.arguments)
            
            start_time = time.time()
            exit_code, output = container.exec_run(command)
            run_time = round(time.time() - start_time, 3)

            success = output.decode().strip() == test.expected_stdout
            log_and_flush(logging.INFO, f"=== Ran test - Exit Code {exit_code} ===")
            log_and_flush(logging.INFO, f"Output: {output.decode()}. Runtime: {run_time}")
            log_and_flush(logging.INFO, f"Passed: {success}. Expected {test.expected_stdout}")
            log_and_flush(logging.INFO, "=========================================")

            yield test.id, output, success, run_time