import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // pdfjs-dist uses Node.js built-ins — exclude from server bundle
  serverExternalPackages: ['pdfjs-dist'],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle the canvas package for client-side
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    return config;
  },
};

export default nextConfig;
