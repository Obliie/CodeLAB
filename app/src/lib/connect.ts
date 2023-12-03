import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { useMemo } from 'react';

// TODO Use URLs once TLS issue is resolved.
export const transport = createGrpcWebTransport({
    baseUrl: 'https://127.0.0.1:443/',
});

export const serverTransport = createGrpcWebTransport({
    baseUrl: 'https://api-gateway:443/',
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
    return createPromiseClient(service, serverTransport);
}
