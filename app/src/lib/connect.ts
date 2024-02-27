import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { useMemo } from 'react';

export const serverTransport = createGrpcWebTransport({
    baseUrl: 'https://api-gateway:443/',
});

/**
 * Get a promise client for the given service.
 */
export function useClient<T extends ServiceType>(service: T): PromiseClient<T> {
    // TODO The transport should only be created once like the server transport
    const transport = createGrpcWebTransport({
        baseUrl: `https://${window.location.host}:443/`,
    });

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
