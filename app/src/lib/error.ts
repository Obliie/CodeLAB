import { ConnectError } from '@connectrpc/connect';

export function handleGrpcError(err: ConnectError) {
    console.info("GRPC Error", err);
}
