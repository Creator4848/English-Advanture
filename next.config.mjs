/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simplest possible config for Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
