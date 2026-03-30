import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/sanity'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const locales = ['ca', 'es', 'en', 'ar', 'ur']
  
  // Get all blog posts
  const posts = await getAllPosts()
  
  // Static pages for each locale
  const staticPages: MetadataRoute.Sitemap = []
  
  locales.forEach((locale) => {
    // Home page
    staticPages.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    })
    
    // Blog listing page
    staticPages.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })
    
    // Registration page
    staticPages.push({
      url: `${baseUrl}/${locale}/inscripcion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    })
    
    // Legal pages
    staticPages.push({
      url: `${baseUrl}/${locale}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    })
    
    staticPages.push({
      url: `${baseUrl}/${locale}/legal/legal-notice`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    })
    
    staticPages.push({
      url: `${baseUrl}/${locale}/legal/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    })
  })
  
  // Blog post pages
  const postPages: MetadataRoute.Sitemap = []
  posts.forEach((post) => {
    locales.forEach((locale) => {
      postPages.push({
        url: `${baseUrl}/${locale}/blog/${post.slug.current}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })
  })
  
  return [...staticPages, ...postPages]
}
