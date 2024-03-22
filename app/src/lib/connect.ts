import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient, Interceptor, PromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { useMemo } from 'react';

const clientauth: Interceptor = (next) => async (req) => {
    await fetch("/api/auth/token").then(res => res.json()).then(async res => {
        req.header.append("Authorization", `Bearer ${res.token}`);
    });

    return await next(req);
};

const serverauth: Interceptor = (next) => async (req) => {
    const session = await getServerSession();
    req.header.append("X-User", `${session?.user.email}`);

    return await next(req);
};

const serverTransport = createGrpcWebTransport({
    baseUrl: `https://${process.env.NEXT_PUBLIC_FRONTEND_URL == "127.0.0.1" ? "api-gateway" : process.env.NEXT_PUBLIC_FRONTEND_URL}:443/`,
    interceptors: [serverauth]
});

const transport = createGrpcWebTransport({
    baseUrl: `https://${process.env.NEXT_PUBLIC_FRONTEND_URL}:443/`,
    interceptors: [clientauth]
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
