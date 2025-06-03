/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['maps.googleapis.com', 'maps.gstatic.com'],
    unoptimized: true,
  },
  // Ensure proper handling of dynamic routes
  trailingSlash: false,
  // Configure output for Netlify
  output: 'standalone',
}

export default nextConfig
