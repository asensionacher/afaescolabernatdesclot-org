'use server'

import { prisma } from '@/lib/db'
import { getCurrentUser, hashPassword, normalizeUsername, verifyPassword } from '@/lib/auth'
import { saveEmailSettings, getEmailSettings } from '@/lib/settings'
import { sendEmail } from '@/lib/email'
import type { ActionState } from './types'

const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('No autoritzat')
  }
  return user
}

export async function saveEmailSettingsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const current = await getEmailSettings()
  const password = String(formData.get('password') ?? '')

  await saveEmailSettings({
    host: String(formData.get('host') ?? '').trim(),
    port: Number.parseInt(String(formData.get('port') ?? '587'), 10) || 587,
    user: String(formData.get('user') ?? '').trim(),
    password: password || current.password,
    secure: formData.get('secure') === 'on' || formData.get('secure') === 'true',
    fromName: String(formData.get('fromName') ?? '').trim(),
    fromEmail: String(formData.get('fromEmail') ?? '').trim(),
  })

  return { status: 'success', message: 'emailSaved' }
}

export async function sendTestEmailAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const to = String(formData.get('to') ?? '').trim()

  if (!to) {
    return { status: 'error', message: 'VALIDATION_ERROR', fieldErrors: { to: 'required' } }
  }

  const result = await sendEmail({
    to,
    subject: 'AFA Bernat Desclot · Correu de proves',
    text: 'Aquest és un correu de proves del web de l’AFA Bernat Desclot.',
  })

  if (!result.sent) {
    return { status: 'error', message: 'testEmailFailed', detail: result.error }
  }

  return { status: 'success', message: 'testEmailSent' }
}

export async function changeAdminCredentialsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin()

  const username = normalizeUsername(String(formData.get('username') ?? ''))
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const currentPassword = String(formData.get('currentPassword') ?? '')

  const fieldErrors: Record<string, string> = {}

  if (!USERNAME_PATTERN.test(username)) fieldErrors.username = 'usernameInvalid'
  if (password.length < 8) fieldErrors.password = 'passwordTooShort'
  if (password !== confirmPassword) fieldErrors.password = 'passwordMismatch'

  const valid = await verifyPassword(currentPassword, admin.passwordHash)
  if (!valid) fieldErrors.currentPassword = 'invalidCurrentPassword'

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'VALIDATION_ERROR', fieldErrors }
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing && existing.id !== admin.id) {
    return { status: 'error', message: 'usernameTaken', fieldErrors: { username: 'usernameTaken' } }
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { username, passwordHash: await hashPassword(password) },
  })

  return { status: 'success', message: 'credentialsSaved' }
}
