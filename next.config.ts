/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ Add this to prevent pg from being bundled
  serverExternalPackages: ['pg'],
};

export default nextConfig;
