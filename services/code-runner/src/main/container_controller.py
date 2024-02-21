import io
import os
import shutil
import tarfile
import time
import docker
import pathlib
import yaml

from common.config import Config
from enum import Enum
from typing import Any, Dict, Set

from protobufs.common.v1 import language_pb2
from docker.models.containers import Container
from docker.models.images import Image


class ContainerStage(Enum):
    CREATED = 1
    RUNNING = 2
    IDLE = 3


class ContainerController:
    DEFAULT_STORAGE_PATH = "/tmp/code-runner"
    DEFAULT_CONTAINER_NAME = "codelab-runner-{container_id}"

    def __init__(self, storage_path: str = DEFAULT_STORAGE_PATH, language_config: Dict[Any, Any] = dict()):
        self.storage_path = storage_path
        self.language_config = language_config
        self.containers: Dict[str, Container] = dict()
        self.docker_client = docker.from_env()

    def __enter__(self):
        os.makedirs(self.storage_path, exist_ok=True)

        return self

    def __exit__(self, exc_type, exc_value, traceback):
        for container in self.containers.values():
            container.stop()
            container.remove(force=True)

        shutil.rmtree(self.storage_path)

    def _generate_runner_config(self, language: language_pb2.ProgrammingLanguage) -> Dict[Any, Any]:
        runner_config_keys = ["docker-image", "main-file", "run-command"]

        config = self.language_config[language_pb2.ProgrammingLanguage.Name(language)]
        if not config:
            raise RuntimeError()

        # Only include specified keys inside runner config.
        return {k: v for k, v in config.items() if k in runner_config_keys}

    def _get_storage_path(self, container_id: str) -> pathlib.Path:
        container_storage_path = pathlib.Path(
            f"{self.storage_path}/{self.DEFAULT_CONTAINER_NAME.format(container_id=container_id)}"
        )
        container_storage_path.mkdir(parents=True, exist_ok=True)

        return container_storage_path

    def _save_runner_config(self, container_id: str, config: Dict[Any, Any]) -> None:
        container_storage_path = self._get_storage_path(container_id=container_id)

        with open(container_storage_path / "config.yaml", "w+") as container_config:
            yaml.dump(config, container_config)

    def _start_container(self, image_name: str) -> Container:
        image: Image = self.docker_client.images.pull(image_name)
        container: Container = self.docker_client.containers.run(image=image, detach=True, tty=True)
        container.rename(self.DEFAULT_CONTAINER_NAME.format(container_id=container.id))
        self.containers[container.id] = container

        container.exec_run(f"mkdir -p {self.DEFAULT_STORAGE_PATH}")

        return container

    def _copy_file_to_container(self, container: Container, src: pathlib.Path, dst_dir: str):
        stream = io.BytesIO()
        with tarfile.open(fileobj=stream, mode="w|") as tar, open(src, "rb") as f:
            info = tar.gettarinfo(fileobj=f)
            info.name = os.path.basename(src)
            tar.addfile(info, f)

        container.exec_run(f"mkdir -p {dst_dir}")
        container.put_archive(dst_dir, stream.getvalue())

    def _copy_bytes_to_container(self, container: Container, src_bytes: bytes, dst_dir: str, path: str):
        stream = io.BytesIO()
        f = io.BytesIO(src_bytes)
        with tarfile.open(fileobj=stream, mode="w|") as tar:
            info = tarfile.TarInfo(name=path)  # File name in archive
            info.mtime = time.time()
            info.size = len(src_bytes)

            tar.addfile(info, f)

        container.exec_run(f"mkdir -p {dst_dir}")
        container.put_archive(dst_dir, stream.getvalue())

    def _get_container(self, container_id: str) -> Container:
        return self.containers[container_id]

    def remove(self, container_id: str):
        container: Container = self._get_container(container_id)

        container.stop()
        container.remove(force=True)

    def create(self, language: language_pb2.ProgrammingLanguage) -> str:
        config = self._generate_runner_config(language)
        container = self._start_container(config["docker-image"])

        self._save_runner_config(container.id, config)
        self._copy_file_to_container(
            container, src=self._get_storage_path(container.id) / "config.yaml", dst_dir=self.DEFAULT_STORAGE_PATH
        )

        return container.id
