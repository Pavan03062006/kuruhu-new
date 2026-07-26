/** @type {import('next').NextConfig} */
const nextConfig = {
  // This application uses API handlers and database-backed dynamic record IDs.
  // A static export can only serve IDs known at build time and causes hosts to
  // fall back to the dashboard for every unknown route. The standalone server
  // matches the Dockerfile and supports the complete App Router route map.
  output: 'standalone',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
