/**
 * 🏗️ NEXT.JS CONFIGURATION - Construction Syndicate GUI
 * ======================================================
 * 
 * ESM-compatible Next.js configuration for construction-themed web interface
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // ESM configuration
  experimental: {
    esmExternals: true
  },
  
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  },
  
  // Image optimization
  images: {
    domains: ['localhost']
  }
};

export default nextConfig;

