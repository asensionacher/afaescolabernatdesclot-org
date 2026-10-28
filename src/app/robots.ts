import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://afaescolabernatdesclot.org'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/el-meu-compte'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
