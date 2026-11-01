import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jetty.francisnaga.site'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/vendor/dashboard',
          '/vendor/dashboard/*',
          '/vendor/products/*',
          '/api/*',
          '/auth/*',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/products/*', '/jetty-*.png', '/jetty-*.svg', '/og-image.png', '/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
