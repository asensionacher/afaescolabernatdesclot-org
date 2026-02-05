'use server'

import { cookies } from 'next/headers'

const SESSION_COOKIE = 'actas_auth'
const SESSION_DURATION = 60 * 60 * 24 // 24 hours in seconds

export async function verifyPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.ACTAS_PASSWORD
  
  if (!correctPassword) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ACTAS_PASSWORD not configured in .env.local')
    }
    return false
  }
  
  return password === correctPassword
}

export async function login(password: string): Promise<boolean> {
  const isValid = await verifyPassword(password)
  
  if (isValid) {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    })
    return true
  }
  
  return false
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === 'authenticated'
}
