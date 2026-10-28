import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from '@/lib/db'
import type { Role, User } from '@prisma/client'

const SESSION_COOKIE = 'afa_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 días

const MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET no configurada (mínimo 32 caracteres)')
  }
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch {
    return false
  }
}

function clientIdentifier(): string {
  return 'local-client'
}

function checkRateLimit(identifier: string): { allowed: boolean; remaining?: number } {
  const now = Date.now()
  const attempt = loginAttempts.get(identifier)
  if (attempt && now > attempt.resetAt) {
    loginAttempts.delete(identifier)
  }
  const current = loginAttempts.get(identifier)
  if (!current) return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  if (current.count >= MAX_ATTEMPTS) return { allowed: false }
  return { allowed: true, remaining: MAX_ATTEMPTS - current.count - 1 }
}

function recordAttempt(identifier: string, success: boolean): void {
  const now = Date.now()
  const attempt = loginAttempts.get(identifier)
  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(identifier, { count: success ? 0 : 1, resetAt: now + RATE_LIMIT_WINDOW })
    return
  }
  attempt.count = success ? 0 : attempt.count + 1
}

/** Normaliza el usuario: minúsculas y sin espacios. */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

export interface LoginResult {
  success: boolean
  error?: 'invalid' | 'rate_limited' | 'inactive'
  user?: User
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const identifier = clientIdentifier()
  const limit = checkRateLimit(identifier)
  if (!limit.allowed) {
    return { success: false, error: 'rate_limited' }
  }

  const user = await prisma.user.findUnique({ where: { username: normalizeUsername(username) } })
  const valid = user ? await verifyPassword(password, user.passwordHash) : false

  if (!user || !valid) {
    recordAttempt(identifier, false)
    return { success: false, error: 'invalid' }
  }

  if (!user.active) {
    return { success: false, error: 'inactive' }
  }

  recordAttempt(identifier, true)

  const token = await new SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  return { success: true, user }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/** Usuario de la sesión actual (null si no hay sesión válida). */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, getSecret())
    const userId = payload.sub
    if (!userId) return null

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.active) return null
    return user
  } catch {
    return null
  }
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

/** Exige sesión de administrador; redirige al login si no la hay. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') redirect('/')
  return user
}

/** Exige sesión (admin o miembro). */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export function hasRole(user: User, role: Role): boolean {
  return user.role === role
}
