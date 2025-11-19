/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Explicitly disable Turbopack (use Webpack instead)
  turbopack: {},
  // Webpack configuration to ignore test files and other non-production files
  webpack: (config, { isServer, webpack }) => {
    // Use IgnorePlugin to ignore test files and non-production files for both client and server
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test/,
        contextRegExp: /thread-stream/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(test|spec)\.(js|ts|mjs)$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^(LICENSE|README\.md|bench\.js)$/,
        contextRegExp: /thread-stream/,
      }),
      // Ignore test files in pino as well
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test/,
        contextRegExp: /pino/,
      })
    );
    
    // Ignore specific problematic files
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['thread-stream/test'] = false;
    config.resolve.alias['thread-stream/LICENSE'] = false;
    config.resolve.alias['thread-stream/README.md'] = false;
    config.resolve.alias['thread-stream/bench.js'] = false;
    
    return config;
  },
}

export default nextConfig
