import os
import pathlib
import time
import uuid
import docker
from common.config import Config
import yaml

from container_controller import ContainerController, ContainerStage
from pytest import CaptureFixture
from docker.models.containers import Container

from protobufs.common.v1 import language_pb2


def test_generate_runner_config_python() -> None:
    controller = ContainerController(language_config=Config.CONFIG["services"]["code-runner"]["languages"])
    config = controller._generate_runner_config(language_pb2.PROGRAMMING_LANGUAGE_PYTHON)

    expected_config_keys = ["docker-image", "run-command", "main-file"]
    for key in expected_config_keys:
        assert key in config
        assert config[key] is not None
        assert config[key] is not ""


def test_generate_runner_config_java() -> None:
    controller = ContainerController(language_config=Config.CONFIG["services"]["code-runner"]["languages"])
    config = controller._generate_runner_config(language_pb2.PROGRAMMING_LANGUAGE_JAVA)

    expected_config_keys = ["docker-image", "run-command", "main-file"]
    for key in expected_config_keys:
        assert key in config
        assert config[key] is not None
        assert config[key] is not ""


def test_save_runner_config_creates_valid_file(datadir: pathlib.Path) -> None:
    container_id = uuid.uuid4()
    test_cfg = {"test-key1": "test-val1", "test-key2": "test-val2", "test-key3": "test-key3"}

    controller = ContainerController(
        storage_path=datadir, language_config=Config.CONFIG["services"]["code-runner"]["languages"]
    )
    controller._save_runner_config(container_id, test_cfg)

    container_storage_path = datadir / controller.DEFAULT_CONTAINER_NAME.format(container_id=container_id)
    assert os.path.exists(container_storage_path)

    container_config_path = container_storage_path / "config.yaml"
    assert os.path.exists(container_config_path)

    with open(container_config_path, "r") as config_file:
        config = yaml.safe_load(config_file)

        for key in test_cfg.keys():
            assert key in config
            assert config[key] is not None
            assert config[key] is not ""


def test_container_start_copies_config(datadir: pathlib.Path) -> None:
    with ContainerController(
        storage_path=datadir, language_config=Config.CONFIG["services"]["code-runner"]["languages"]
    ) as controller:
        container_id: str = controller.create(language_pb2.PROGRAMMING_LANGUAGE_PYTHON)

        container: Container = controller._get_container(container_id)

        # Check config file is copied to container
        exit_code, _ = container.exec_run("test -f /tmp/code-runner/config.yaml")
        assert exit_code == 0


def test_copy_bytes_to_container(datadir: pathlib.Path) -> None:
    with ContainerController(
        storage_path=datadir, language_config=Config.CONFIG["services"]["code-runner"]["languages"]
    ) as controller:
        container_id: str = controller.create(language_pb2.PROGRAMMING_LANGUAGE_PYTHON)

        container: Container = controller._get_container(container_id)
        test_file_bytes = b"Test String123"
        controller._copy_bytes_to_container(container, test_file_bytes, "/tmp/code-runner", "main.py")

        # Check config file is copied to container
        exit_code, output = container.exec_run("cat /tmp/code-runner/main.py")
        assert exit_code == 0
        assert output == test_file_bytes
