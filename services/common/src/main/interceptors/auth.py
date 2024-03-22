import grpc
from typing import Callable, Any
from common.service_logging import log_and_flush
import logging

class AuthInterceptor(grpc.ServerInterceptor):
    def __init__(self):

        def abort(ignored_request, context):
            context.abort(grpc.StatusCode.UNAUTHENTICATED, 'Invalid signature')

        self._abortion = grpc.unary_unary_rpc_method_handler(abort)

    def intercept_service(self, continuation, handler_call_details):
        metadata = handler_call_details.invocation_metadata()
        token = metadata.get('authorization', [b'']);
        #dtoken = decrypt_jwt(token)
        log_and_flush(logging.INFO, f"Token (Intercept): {token}");
        return continuation(handler_call_details)