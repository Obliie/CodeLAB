/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    modularizeImports: {
        '@mui/icons-material': {
            transform: '@mui/icons-material/{{member}}',
        },
    },
    /*
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://codelab.obliie.dev:8080/:path*', // Proxy to Backend
            },
        ];
    },*/
};

module.exports = nextConfig;
