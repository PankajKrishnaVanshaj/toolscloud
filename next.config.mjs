/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Filesystem caching
    config.cache = {
      type: 'filesystem',
      compression: 'gzip',
      store: 'pack',
    };

    // Add thread-loader with proper Babel config
    config.module.rules.push({
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'thread-loader',
          options: {
            workers: 2, // Adjust to your CPU cores
            workerParallelJobs: 50,
          },
        },
        {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel'], // Ensure JSX support
          },
        },
      ],
    });

    // Chunk splitting
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      chunks: 'all',
      maxSize: 200000,
      minSize: 30000,
    };

    config.resolve.extensions.push('.js', '.jsx');

    return config;
  },
};

export default nextConfig;