/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ Prevent pg from being bundled in browser
  serverExternalPackages: ['pg'],
};

export default nextConfig;
