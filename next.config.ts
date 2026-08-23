import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  /**
   * pdfjs-dist (utilisé par pdf-parse) charge son fichier "worker" via un chemin résolu
   * dynamiquement au runtime, que le traceur de fichiers de Vercel ne détecte pas — il est
   * donc absent du bundle serverless en production alors qu'il fonctionne en local où tout
   * node_modules est présent sur disque. On l'inclut explicitement.
   */
  outputFileTracingIncludes: {
    '/api/ai/ingest': ['./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],
  },
  /**
   * LBS Call Center - Next.js config (Next.js 15).
   * Goal: sane defaults for performance, security headers, and image handling.
   */
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Prevent Next from picking the wrong workspace root (you have multiple lockfiles).
   * This avoids missing-file/runtime issues in server output tracing on Windows.
   */
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ['image/avif', 'image/webp'],
    /**
     * Images distantes (comme celles du dossier `public/`, mais via URL).
     * Ajoutez d’autres hôtes (S3, Cloudinary, Twilio…) ici si besoin.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
