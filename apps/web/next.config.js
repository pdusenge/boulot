/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@boulot/ui', '@boulot/types', '@boulot/utils'],
};

module.exports = nextConfig;
