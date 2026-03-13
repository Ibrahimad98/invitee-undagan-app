/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@invitee/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
    ],
  },
};

module.exports = nextConfig;
