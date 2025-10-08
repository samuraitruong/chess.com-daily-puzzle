/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use export for CI/deployment, standalone for local development
  output: process.env.NODE_ENV === 'production' && process.env.CI ? 'export' : 'standalone',
  // Silence workspace-root inference warning when multiple lockfiles exist
  outputFileTracingRoot: require('path').join(__dirname, '..'),
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH,
};
if (process.env.NEXT_PUBLIC_BASE_PATH) {
  nextConfig.basePath = process.env.NEXT_PUBLIC_BASE_PATH;
}
module.exports = nextConfig;
