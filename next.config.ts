import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['picsum.photos'],
    unoptimized: true, // Required for static export
  },
  webpack: (config, { isServer }) => {
    // Fix for handlebars compatibility with webpack
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Ignore handlebars require.extensions warning
    config.ignoreWarnings = [
      { module: /handlebars/ },
      { message: /require\.extensions is not supported/ },
    ];

    return config;
  },

};

export default nextConfig;
