from concurrent import futures
import logging
import os

import grpc
import pika
from protobufs.services.v1 import status_service_pb2, status_service_pb2_grpc

from common.config import Config
from common.service_logging import init_logging, log_and_flush


class StatusServicer(status_service_pb2_grpc.StatusService):
    QUEUE_HOST = Config.CONFIG["services"]["status"]["queue"]["host"]
    QUEUE_PORT = Config.CONFIG["services"]["status"]["queue"]["port"]

    def __init__(self) -> None:
        super().__init__()

    def PostStatusEvent(self,
        request: status_service_pb2.PostStatusEventRequest,
        context: grpc.ServicerContext
    ) -> status_service_pb2.PostStatusEventResponse:
        creds = pika.PlainCredentials(username="admin", password="password")
        with pika.BlockingConnection(pika.ConnectionParameters(host=self.QUEUE_HOST, port=self.QUEUE_PORT, credentials=creds)) as connection:
            channel = connection.channel()
            channel.exchange_declare(exchange='events', exchange_type='topic')
            channel.basic_publish(exchange='events', routing_key=request.event_group, body=request.data, properties=pika.BasicProperties(delivery_mode=2))

        return status_service_pb2.PostStatusEventResponse()

    def SubscribeStatusEvents(self,
        request: status_service_pb2.SubscribeStatusEventsRequest,
        context: grpc.ServicerContext
    ) -> status_service_pb2.SubscribeStatusEventsResponse:
        creds = pika.PlainCredentials(username="admin", password="password")
        with pika.BlockingConnection(pika.ConnectionParameters(host=self.QUEUE_HOST, port=self.QUEUE_PORT, credentials=creds)) as connection:
            channel = connection.channel()
            channel.exchange_declare(exchange='events', exchange_type='topic')
            result = channel.queue_declare('', exclusive=True, durable=True)

            log_and_flush(logging.INFO, f"Created queue {result.method.queue} and subbed to {request.event_group}")

            channel.queue_bind(exchange='events', queue=result.method.queue, routing_key=request.event_group)
            for method_frame, properties, body in channel.consume(queue=result.method.queue, inactivity_timeout=1):
                if method_frame:
                    event_message = body.decode('utf-8')
                    if event_message == "end":
                        log_and_flush(logging.INFO, f"Ending event stream for event group: {request.event_group}")
                        break
                    
                    event = status_service_pb2.SubscribeStatusEventsResponse(event=event_message)
                    yield event


def serve() -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    status_service_pb2_grpc.add_StatusServiceServicer_to_server(
        StatusServicer(), server
    )
    server.add_insecure_port(f"[::]:{ os.environ['STATUS_SERVICE_PORT'] }")
    log_and_flush(logging.INFO, "Starting Status service...")
    logging.getLogger("pika").setLevel(logging.WARNING)
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    init_logging()
    serve()
