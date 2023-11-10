import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { useMemo } from 'react';

// TODO Use URLs once TLS issue is resolved.
export const transport = createGrpcWebTransport({
    baseUrl: 'http://127.0.0.1:8080',
});

export const serverTransport = createGrpcWebTransport({
    baseUrl: 'http://api-gateway:8080',
});

/**
 * Get a promise client for the given service.
 */
export function useClient<T extends ServiceType>(service: T): PromiseClient<T> {
    // We memoize the client, so that we only create one instance per service.
    return useMemo(() => createPromiseClient(service, transport), [service]);
}

/**
 * Get a promise client for the given service.
 */
export function useServerClient<T extends ServiceType>(service: T): PromiseClient<T> {
    // We memoize the client, so that we only create one instance per service.
    return useMemo(() => createPromiseClient(service, serverTransport), [service]);
}
