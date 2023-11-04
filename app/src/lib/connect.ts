import { useMemo } from 'react';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { ServiceType } from '@bufbuild/protobuf';

const transport = createGrpcWebTransport({
    baseUrl: 'http://0.0.0.0:8080/',
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
    return createPromiseClient(service, transport);
}
