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
      {
        source: '/product/:slug',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow, noarchive' },
          { key: 'Link', value: '</product/:slug>; rel="canonical"' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // SEO: Redirect old/common misspellings to brand
      { source: '/vchuki', destination: '/', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      // HIGH-INTENT KEYWORD LANDING PAGES (redirect to category)
      { source: '/full-sleeve-shirts', destination: '/shirts/linen-full-sleeve', permanent: false },
      { source: '/half-sleeve-shirts', destination: '/shirts/linen-half-sleeve', permanent: false },
      { source: '/short-kurtas', destination: '/shirts/kurta-half-sleeve', permanent: false },
      { source: '/short-kurta-for-men', destination: '/shirts/kurta-half-sleeve', permanent: false },
      { source: '/linen-shirts-men', destination: '/shirts/linen-full-sleeve', permanent: false },
      { source: '/linen-shirts-for-men', destination: '/shirts/linen-full-sleeve', permanent: false },
      { source: '/cotton-linen-shirts', destination: '/shirts', permanent: false },
      { source: '/premium-shirts-for-men', destination: '/shirts', permanent: false },
      { source: '/summer-shirts-men', destination: '/shirts/linen-half-sleeve', permanent: false },
      { source: '/kurta-for-men', destination: '/shirts/kurta-half-sleeve', permanent: false },
      { source: '/premium-kurta-men', destination: '/shirts/kurta-full-sleeve', permanent: false },
      { source: '/luxury-ethnic-wear-men', destination: '/shirts/kurta-full-sleeve', permanent: false },
      // Category aliases
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
      // Old indexed products that no longer exist — redirect to collection
      { source: '/product/heritage-urban-oversized-shirt-navy-332', destination: '/shirts', permanent: true },
      { source: '/product/classic-sherwani-style-shirt-olive-495', destination: '/shirts', permanent: true },
      { source: '/product/classic-dobby-texture-shirt-white-41', destination: '/shirts', permanent: true },
    ];
  },
};

export default nextConfig;
