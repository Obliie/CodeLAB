import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { useMemo } from 'react';

export const serverTransport = createGrpcWebTransport({
    baseUrl: `https://${process.env.FRONTEND_URL == "127.0.0.1" ? "api-gateway" : process.env.FRONTEND_URL}:443/`,
});

const transport = createGrpcWebTransport({
    baseUrl: `https://${process.env.FRONTEND_URL}:443/`,
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
