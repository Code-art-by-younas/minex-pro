/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ✅ Render ke liye zaroori
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
