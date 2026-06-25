/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'u1kwkwq0sju0a3pp.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // SEO: Redirect old/common misspellings to brand
      { source: '/vchuki', destination: '/', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      // Category aliases for SEO
      { source: '/linen-shirts', destination: '/shirts/linen-full-sleeve', permanent: true },
      { source: '/kurta', destination: '/shirts/kurta-half-sleeve', permanent: true },
      { source: '/kurtas', destination: '/shirts/kurta-half-sleeve', permanent: true },
      { source: '/linen', destination: '/shirts/linen-full-sleeve', permanent: true },
      { source: '/formal-shirts', destination: '/shirts', permanent: true },
      { source: '/casual-shirts', destination: '/shirts', permanent: true },
      { source: '/premium-shirts', destination: '/shirts', permanent: true },
      // Trailing slash normalization
      { source: '/shirts/', destination: '/shirts', permanent: true },
      { source: '/blog/', destination: '/blog', permanent: true },
      { source: '/about/', destination: '/about', permanent: true },
    ];
  },
};

export default nextConfig;
