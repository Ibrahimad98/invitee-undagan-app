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
      {
        protocol: 'https',
        hostname: '*.s3.ap-southeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
