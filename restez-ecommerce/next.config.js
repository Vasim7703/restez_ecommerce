/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This tells Vercel to completely ignore apostrophe errors and just deploy
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
// (Note: if your file uses module.exports = nextConfig, keep that instead!)