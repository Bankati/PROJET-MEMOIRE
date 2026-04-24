import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    formats: ["image/avif", "image/webp"],
    /**
     * Images distantes (comme celles du dossier `public/`, mais via URL).
     * Ajoutez d’autres hôtes (S3, Cloudinary, Twilio…) ici si besoin.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
