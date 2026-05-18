/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow large file uploads (10MB limit enforced in API route)
  experimental: {
    serverActions: { bodySizeLimit: '15mb' },
  },
};

module.exports = nextConfig;
