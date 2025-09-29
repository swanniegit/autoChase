/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          // Note: HSTS only applies over HTTPS; includeSubDomains optional based on domain setup
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Basic CSP (adjust if you add external resources)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.payfast.co.za https://www.payfast.co.za",
              "frame-ancestors 'none'",
              "img-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://*.supabase.co",
              'base-uri \"self\"',
              'form-action https://sandbox.payfast.co.za https://www.payfast.co.za',
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
