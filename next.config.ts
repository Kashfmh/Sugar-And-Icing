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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' blob: data: https://*.supabase.co;
              font-src 'self';
              connect-src 'self' https://*.supabase.co https://api.stripe.com;
              frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
