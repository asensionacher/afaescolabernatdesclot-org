import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-21',
  useCdn: true,
})

export interface Event {
  _id: string
  _type: 'event'
  title: {
    ca: string
    es: string
    en: string
    ar: string
    ur: string
  }
  slug: {
    current: string
  }
  startDate: string
  endDate: string
  publishedAt?: string
  excerpt?: {
    ca: string
    es: string
    en: string
    ar: string
    ur: string
  }
  externalUrl?: string
  mainImage?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
}

export interface Post {
  _id: string
  _type: 'post'
  title: {
    ca: string
    es: string
    en: string
    ar: string
    ur: string
  }
  slug: {
    current: string
  }
  publishedAt: string
  excerpt?: {
    ca: string
    es: string
    en: string
    ar: string
    ur: string
  }
  mainImage?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
}

// Fetch upcoming events (sorted by event date, most recent first)
export async function getUpcomingEvents(limit = 10): Promise<Event[]> {
  // Get current date at start of day in ISO format
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to start of day
  const todayISO = now.toISOString();
  
  const query = `*[_type == "event" && startDate >= $today] | order(startDate asc) [0...${limit}] {
    _id,
    _type,
    title,
    slug,
    startDate,
    endDate,
    publishedAt,
    excerpt,
    externalUrl,
    mainImage
  }`
  
  return client.fetch(query, { today: todayISO })
}

// Fetch all events
export async function getAllEvents(): Promise<Event[]> {
  const query = `*[_type == "event"] | order(startDate asc) {
    _id,
    _type,
    title,
    slug,
    startDate,
    endDate,
    publishedAt,
    excerpt,
    externalUrl,
    mainImage
  }`
  
  return client.fetch(query)
}

// Fetch recent blog posts
export async function getRecentPosts(limit = 3): Promise<Post[]> {
  const query = `*[_type == "post"] | order(publishedAt desc) [0...${limit}] {
    _id,
    _type,
    title,
    slug,
    publishedAt,
    excerpt,
    mainImage
  }`
  
  return client.fetch(query)
}

// Fetch all blog posts
export async function getAllPosts(): Promise<Post[]> {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    _type,
    title,
    slug,
    publishedAt,
    excerpt,
    mainImage
  }`
  
  return client.fetch(query)
}

// Fetch single post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    publishedAt,
    excerpt,
    body,
    mainImage
  }`
  
  return client.fetch(query, { slug })
}
