import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... other config options
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mqmsqinuwiaujbmzbngh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
