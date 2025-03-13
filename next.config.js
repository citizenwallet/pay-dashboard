const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'ipfs.internal.citizenwallet.xyz',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'ounjigiydhimruivuxjv.supabase.co',
        port: ''
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

module.exports = withNextIntl(nextConfig);
