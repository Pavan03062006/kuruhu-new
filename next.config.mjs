const isStandaloneBuild = process.env.BUILD_STANDALONE === 'true'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This application uses API handlers and database-backed dynamic record IDs.
  // A static export can only serve IDs known at build time and causes hosts to
  // fall back to the dashboard for every unknown route. Managed Next.js hosts
  // use the standard output with `next start`; Docker opts into standalone.
  output: isStandaloneBuild ? 'standalone' : undefined,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
