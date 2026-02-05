'use server'

/**
 * Secure Authentication System for /actas
 * 
 * Features:
 * - JWT signed tokens (HS256, 512-bit secret)
 * - bcrypt password hashing (12 rounds)
 * - Rate limiting (5 attempts per 15 minutes)
 * - HttpOnly + SameSite cookies
 * - Automatic token expiration (24 hours)
 * - Login attempt logging
 * 
 * Security: Cookies are only modified in Server Actions (login/logout)
 * Read-only operations (isAuthenticated) are safe to call from page components
 */

import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'

const SESSION_COOKIE = 'actas_auth'
const SESSION_DURATION = 60 * 60 * 24 // 24 hours in seconds

// In-memory rate limiting store (for simple implementation)
// In production, consider using Redis or similar
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

// Rate limiting configuration
const MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes in milliseconds

/**
 * Get JWT secret from environment
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured. Run: node scripts/generate-security-credentials.js')
  }
  
  return new TextEncoder().encode(secret)
}

/**
 * Get password hash from environment
 */
function getPasswordHash(): string {
  const hashBase64 = process.env.ACTAS_PASSWORD_HASH_BASE64
  
  if (!hashBase64) {
    throw new Error('ACTAS_PASSWORD_HASH_BASE64 not configured. Run: node scripts/generate-security-credentials.js')
  }
  
  // Decode from base64
  const hash = Buffer.from(hashBase64, 'base64').toString('utf-8')
  
  return hash
}

/**
 * Check rate limiting for an identifier (IP address)
 */
function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts?: number } {
  const now = Date.now()
  const attempt = loginAttempts.get(identifier)

  // Clean up expired entries
  if (attempt && now > attempt.resetAt) {
    loginAttempts.delete(identifier)
  }

  const current = loginAttempts.get(identifier)

  if (!current) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 }
  }

  if (current.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((current.resetAt - now) / 1000 / 60) // minutes
    console.warn(`Rate limit exceeded for ${identifier}. Resets in ${remainingTime} minutes.`)
    return { allowed: false }
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - current.count - 1 }
}

/**
 * Record a login attempt
 */
function recordLoginAttempt(identifier: string, success: boolean): void {
  const now = Date.now()
  const attempt = loginAttempts.get(identifier)

  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(identifier, {
      count: success ? 0 : 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    })
  } else {
    attempt.count += success ? -1 : 1 // Decrease on success, increase on failure
    if (attempt.count < 0) attempt.count = 0
  }

  // Log failed attempts
  if (!success) {
    console.warn(`Failed login attempt for ${identifier}. Attempts: ${loginAttempts.get(identifier)?.count || 0}/${MAX_ATTEMPTS}`)
  }
}

/**
 * Get client identifier (IP address) for rate limiting
 */
function getClientIdentifier(): string {
  // In a real deployment with a proxy, you'd use headers like X-Forwarded-For
  // For now, we'll use a simple identifier
  return 'client' // In production, extract from headers
}

/**
 * Verify password against stored bcrypt hash
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const passwordHash = getPasswordHash()
    return await bcrypt.compare(password, passwordHash)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Password verification error:', error)
    }
    return false
  }
}

/**
 * Create a signed JWT token for the session
 */
async function createSessionToken(): Promise<string> {
  const secret = getJWTSecret()
  
  const token = await new SignJWT({
    authenticated: true,
    iat: Math.floor(Date.now() / 1000),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  return token
}

/**
 * Verify a JWT token
 */
async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const secret = getJWTSecret()
    await jwtVerify(token, secret)
    return true
  } catch (error) {
    // Token is invalid or expired
    return false
  }
}

/**
 * Login with password
 * Returns an object with success status and optional error message
 */
export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  const clientId = getClientIdentifier()

  // Check rate limiting
  const rateLimitCheck = checkRateLimit(clientId)
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      error: 'Massa intents fallits. Torna-ho a provar més tard.',
    }
  }

  // Verify password
  const isValid = await verifyPassword(password)

  // Record attempt
  recordLoginAttempt(clientId, isValid)

  if (isValid) {
    try {
      // Create JWT token
      const token = await createSessionToken()

      // Set secure cookie
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION,
        path: '/',
      })

      console.log(`Successful login for ${clientId}`)
      return { success: true }
    } catch (error) {
      console.error('Error creating session:', error)
      return {
        success: false,
        error: 'Error en crear la sessió',
      }
    }
  }

  return {
    success: false,
    error: `Contrasenya incorrecta${rateLimitCheck.remainingAttempts !== undefined ? ` (${rateLimitCheck.remainingAttempts} intents restants)` : ''}`,
  }
}

/**
 * Logout and clear session
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  console.log('User logged out')
}

/**
 * Check if user is authenticated
 * Verifies JWT token signature and expiration
 * Note: This function only reads cookies, doesn't modify them
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get(SESSION_COOKIE)

    if (!session?.value) {
      return false
    }

    // Verify JWT token
    const isValid = await verifySessionToken(session.value)

    // Note: We don't delete invalid tokens here because this function
    // is called from page components (not Server Actions).
    // Invalid tokens will simply fail verification and user will see login form.
    // The cookie will be overwritten on next successful login.

    return isValid
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Authentication check error:', error)
    }
    return false
  }
}
