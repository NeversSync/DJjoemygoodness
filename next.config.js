/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  // This drive's FS returns EISDIR on readlink for normal files (breaks webpack).
  webpack: (config) => {
    config.resolve.symlinks = false;
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
