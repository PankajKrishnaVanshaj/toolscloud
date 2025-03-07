/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.cache = {
          type: "filesystem",
          compression: "gzip", // Compress cache files
          store: "pack", // Use pack cache strategy
        };
        return config;
      },
};

export default nextConfig;
