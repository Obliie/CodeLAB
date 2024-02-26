import time
import logging
import threading
from typing import Any, Dict, Generator, List
from protobufs.common.v1 import language_pb2, solution_pb2
from container_controller import ContainerController
from docker.models.containers import Container

from common.service_logging import log_and_flush
from protobufs.common.v1 import problem_pb2
from runners.test_runner import BaseTestRunner

EXIT_CODE_KEY = "exit_code"
OUTPUT_KEY = "output"

class SeriesTestRunner(BaseTestRunner):

    def __init__(self, container_controller: ContainerController, solution_files: List[solution_pb2.SolutionFile], tests: problem_pb2.Problem.TestData, language: language_pb2.ProgrammingLanguage, run_timeout: int, run_max_memory: int, config: Dict[Any, Any]):
        super(SeriesTestRunner, self).__init__(container_controller, solution_files, language, run_timeout, run_max_memory, config)
        self.tests = tests
        self.config = config
        self.run_timeout = run_timeout
        self.run_max_memory = run_max_memory

    def exec_run_with_timeout(self, container: Container, command: str, timeout: int):
        def exec(self, results):
            exit_code, output = container.exec_run(command)

            results[EXIT_CODE_KEY] = exit_code
            results[OUTPUT_KEY] = output
        
        results = {}
        command_thread = threading.Thread(target=exec, args=(self, results))
        command_thread.start()
        command_thread.join(timeout)

        if command_thread.is_alive():
            print(f"Timeout... killing container {container.name}")
            container.kill()
            return None, None
        
        return results[EXIT_CODE_KEY], results[OUTPUT_KEY]

    def run_tests(self) -> Any:
        for test in self.tests:
            container: Container = self.container_controller._get_container(self.container_id)
            command = self.config["run-command"].format(FILE=f"{self.DEFAULT_STORAGE_PATH}/{self.config['main-file']}", ARGS=test.arguments)
            
            start_time = time.time()
            exit_code, output = self.exec_run_with_timeout(container, command, self.run_timeout)
            run_time = round(time.time() - start_time, 3)

            if exit_code is None:
                yield test.id, None, None, None, True
                return

            success = output.decode().strip() == test.expected_stdout
            log_and_flush(logging.INFO, f"Constraints | Timeout: {self.run_timeout} | Max Memory: {self.run_max_memory}")
            log_and_flush(logging.INFO, f"=== Ran test - Exit Code {exit_code} ===")
            log_and_flush(logging.INFO, f"Output: {output.decode()}. Runtime: {run_time}")
            log_and_flush(logging.INFO, f"Passed: {success}. Expected {test.expected_stdout}")
            log_and_flush(logging.INFO, "=========================================")

            yield test.id, output, success, run_time, False