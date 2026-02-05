import { createClient } from 'next-sanity'

const token = process.env.SANITY_API_TOKEN

if (!token) {
  console.warn('⚠️ SANITY_API_TOKEN is not set!')
} else {
  console.log('✅ SANITY_API_TOKEN is configured')
}

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-21',
  useCdn: true,
})

export const clientWithToken = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-21',
  useCdn: false,
  token: token,
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

// Meeting Reports Types and Functions
export interface Attendee {
  _key?: string
  studentName: string
  course: string
  attendantName: string
}

export interface MeetingReport {
  _id: string
  _type: 'meetingReport'
  title: string
  meetingDate: string
  attendees: Attendee[]
  content: string
  signerName: string
  signerRole: string
  status: 'draft' | 'closed'
  createdAt: string
  closedAt?: string
}

// Fetch all meeting reports
export async function getAllMeetingReports(): Promise<MeetingReport[]> {
  const query = `*[_type == "meetingReport"] | order(meetingDate desc) {
    _id,
    _type,
    title,
    meetingDate,
    attendees,
    content,
    signerName,
    signerRole,
    status,
    createdAt,
    closedAt
  }`
  
  // Use clientWithToken (no CDN) to get fresh data
  return clientWithToken.fetch(query)
}

// Fetch single meeting report by ID
export async function getMeetingReportById(id: string): Promise<MeetingReport | null> {
  const query = `*[_type == "meetingReport" && _id == $id][0] {
    _id,
    _type,
    title,
    meetingDate,
    attendees,
    content,
    signerName,
    signerRole,
    status,
    createdAt,
    closedAt
  }`
  
  // Use clientWithToken (no CDN) to get fresh data
  return clientWithToken.fetch(query, { id })
}

// Create a new meeting report
export async function createMeetingReport(data: Omit<MeetingReport, '_id' | '_type' | 'createdAt' | 'closedAt'>): Promise<MeetingReport> {
  console.log('📝 Creating meeting report with data:', JSON.stringify(data, null, 2))
  
  try {
    const result = await clientWithToken.create({
      _type: 'meetingReport',
      ...data,
      createdAt: new Date().toISOString(),
    }) as MeetingReport
    console.log('✅ Successfully created:', result)
    return result
  } catch (error) {
    console.error('❌ Failed to create meeting report:', error)
    throw error
  }
}

// Update an existing meeting report
export async function updateMeetingReport(id: string, data: Partial<MeetingReport>): Promise<MeetingReport> {
  return clientWithToken.patch(id).set(data).commit()
}

// Close a meeting report
export async function closeMeetingReport(id: string): Promise<MeetingReport> {
  return clientWithToken.patch(id).set({
    status: 'closed',
    closedAt: new Date().toISOString(),
  }).commit()
}

// Delete a draft meeting report
export async function deleteMeetingReport(id: string): Promise<void> {
  console.log('🗑️ Deleting document from Sanity:', id)
  try {
    await clientWithToken.delete(id)
    console.log('✅ Document deleted successfully from Sanity:', id)
  } catch (error) {
    console.error('❌ Failed to delete from Sanity:', error)
    throw error
  }
}
