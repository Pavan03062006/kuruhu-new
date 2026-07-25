/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
