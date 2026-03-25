/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@invitee/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://3.26.37.74/api/:path*',
      },
    ];
  },
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
