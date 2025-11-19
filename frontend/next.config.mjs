/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    webpack: (config, {
        webpack
    }) => {
        // Comprehensive ignore patterns for problematic files
        const ignorePatterns = [
            /^\.\/test\//,
            /\/test\//,
            /\.(test|spec)\.(js|mjs|ts|tsx)$/,
            /\.(md|txt|LICENSE)$/,
            /\/bench\.js$/,
            /\/bench\//,
        ];

        ignorePatterns.forEach(pattern => {
            config.plugins.push(
                new webpack.IgnorePlugin({
                    resourceRegExp: pattern,
                })
            );
        });

        // Add resolve fallbacks for missing test dependencies
        config.resolve = config.resolve || {};
        config.resolve.fallback = {
            ...config.resolve.fallback,
            'tap': false,
            'tape': false,
            'desm': false,
            'fastbench': false,
            'pino-elasticsearch': false,
            'why-is-node-running': false,
        };

        return config;
    },
}

export default nextConfig