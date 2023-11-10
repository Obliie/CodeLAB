import logging
from typing import List
from protobufs.common.v1 import language_pb2, solution_pb2
from container_controller import ContainerController
from docker.models.containers import Container

from common.service_logging import log_and_flush


class BaseTestRunner:
    def __init__(self, container_controller: ContainerController, solution_files: List[solution_pb2.SolutionFile]):
        self.container_controller = container_controller
        self.solution_files = solution_files

    def __enter__(self):
        self.container_id: str = self.container_controller.create(language_pb2.PROGRAMMING_LANGUAGE_PYTHON)
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.container_controller.remove(self.container_id)
        return self

    def run_tests(self) -> str:
        container: Container = self.container_controller._get_container(self.container_id)

        for file in self.solution_files:
            if file.main_file:
                self.container_controller._copy_bytes_to_container(container, file.data, "/tmp/code-runner")

        exit_code, output = container.exec_run("python3 /tmp/code-runner/main.py")

        log_and_flush(logging.INFO, f"=== Ran test - Exit Code {exit_code} ===")
        log_and_flush(logging.INFO, output)
        log_and_flush(logging.INFO, "=========================================")

        return output
