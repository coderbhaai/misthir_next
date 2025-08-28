import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'imagedelivery.net', port: '', pathname: '/**', },
    ],
  },
};

export default nextConfig;