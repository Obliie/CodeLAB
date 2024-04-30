import logging
from typing import Any, Dict, List
from protobufs.common.v1 import language_pb2, solution_pb2
from container_controller import ContainerController
from docker.models.containers import Container

from common.service_logging import log_and_flush

class BaseTestRunner:
    DEFAULT_STORAGE_PATH = "/tmp/code-runner"

    def __init__(self, container_controller: ContainerController, solution_files: List[solution_pb2.SolutionFile], language: language_pb2.ProgrammingLanguage, run_timeout: int, run_max_memory: int, config: Dict[Any, Any]):
        self.container_controller = container_controller
        self.solution_files = solution_files
        self.config = config
        self.language = language
        self.run_timeout = run_timeout
        self.run_max_memory = run_max_memory

    def __enter__(self):
        self.container_id: str = self.container_controller.create(self.language, self.run_max_memory)
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.container_controller.remove(self.container_id)
        return self
    
    def setup(self) -> None:
        container: Container = self.container_controller._get_container(self.container_id)

        for file in self.solution_files:
            if file.entry:
                self.container_controller._copy_bytes_to_container(container, file.data, self.DEFAULT_STORAGE_PATH, file.path)
    
    def run_tests(self) -> str:
        container: Container = self.container_controller._get_container(self.container_id)

        exit_code, output = container.exec_run(self.config["run-command"].format(FILE=f"{self.DEFAULT_STORAGE_PATH}/{self.config['main-file']}", ARGS=""))

        log_and_flush(logging.INFO, f"=== Ran test - Exit Code {exit_code} ===")
        log_and_flush(logging.INFO, output)
        log_and_flush(logging.INFO, "=========================================")

        return output
