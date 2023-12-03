from concurrent import futures
import logging
import os

import grpc
from protobufs.services.v1 import status_service_pb2, status_service_pb2_grpc

from common.config import Config
from common.service_logging import init_logging, log_and_flush


class StatusServicer(status_service_pb2_grpc.StatusService):
    def __init__(self):
        self.removeme = 1

def serve() -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    status_service_pb2_grpc.add_StatusServiceServicer_to_server(
        StatusServicer(), server
    )
    server.add_insecure_port(f"[::]:{ os.environ['STATUS_SERVICE_PORT'] }")
    log_and_flush(logging.INFO, "Starting Status service...")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    init_logging()
    serve()
