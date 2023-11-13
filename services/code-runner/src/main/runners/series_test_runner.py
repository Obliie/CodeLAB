import time
import logging
from typing import List
from protobufs.common.v1 import language_pb2, solution_pb2
from container_controller import ContainerController
from docker.models.containers import Container

from common.service_logging import log_and_flush
from protobufs.common.v1 import problem_pb2
from runners.test_runner import BaseTestRunner


class SeriesTestRunner(BaseTestRunner):

    def __init__(self, container_controller: ContainerController, solution_files: List[solution_pb2.SolutionFile], tests: problem_pb2.Problem.TestData):
        super(SeriesTestRunner, self).__init__(container_controller, solution_files)
        self.tests = tests

    def run_tests(self) -> str:
        for test in self.tests:
            container: Container = self.container_controller._get_container(self.container_id)

            start_time = time.time()
            exit_code, output = container.exec_run(f"python3 /tmp/code-runner/main.py {test.arguments}")
            run_time = round(time.time() - start_time, 3)

            success = output.decode().strip() == test.expected_stdout
            log_and_flush(logging.INFO, f"=== Ran test - Exit Code {exit_code} ===")
            log_and_flush(logging.INFO, f"Output: {output.decode()}. Runtime: {run_time}")
            log_and_flush(logging.INFO, f"Passed: {success}. Expected {test.expected_stdout}")
            log_and_flush(logging.INFO, "=========================================")

            yield output, success, run_time