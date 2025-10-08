/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Silence workspace-root inference warning when multiple lockfiles exist
  outputFileTracingRoot: require('path').join(__dirname, '..'),
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH,
};
if (process.env.NEXT_PUBLIC_BASE_PATH) {
  nextConfig.basePath = process.env.NEXT_PUBLIC_BASE_PATH;
}
module.exports = nextConfig;
