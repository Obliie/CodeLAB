/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    modularizeImports: {
        '@mui/icons-material': {
            transform: '@mui/icons-material/{{member}}',
        },
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    env: {
        NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    },
    async rewrites() {
        return [
            {
                source: '/problem',
                destination: '/problem/list',
            },
            {
                source: '/group',
                destination: '/group/list',
            },
            {
                source: '/group/:groupId/problem/:problemId',
                destination: '/problem/:problemId',
            },
        ];
    },
};

module.exports = nextConfig;
