'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser, hashPassword, normalizeUsername, verifyPassword } from '@/lib/auth'
import type { MembershipStatus, Role } from '@prisma/client'
import type { ActionState } from './types'

const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('No autoritzat')
  }
  return user
}

function readMemberForm(formData: FormData) {
  return {
    username: normalizeUsername(String(formData.get('username') ?? '')),
    password: String(formData.get('password') ?? ''),
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    phone: String(formData.get('phone') ?? '').trim(),
    role: String(formData.get('role') ?? 'MEMBER') === 'ADMIN' ? 'ADMIN' : 'MEMBER',
    active: formData.get('active') === 'on' || formData.get('active') === 'true',
    note: String(formData.get('note') ?? '').trim(),
  }
}

export async function createMemberAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const data = readMemberForm(formData)
  const fieldErrors: Record<string, string> = {}

  if (!USERNAME_PATTERN.test(data.username)) fieldErrors.username = 'usernameInvalid'
  if (data.password.length < 8) fieldErrors.password = 'passwordTooShort'
  if (!data.name) fieldErrors.name = 'required'
  if (!data.email) fieldErrors.email = 'required'
  else if (!EMAIL_PATTERN.test(data.email)) fieldErrors.email = 'email'

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'VALIDATION_ERROR', fieldErrors }
  }

  const existing = await prisma.user.findUnique({ where: { username: data.username } })
  if (existing) {
    return { status: 'error', message: 'usernameTaken', fieldErrors: { username: 'usernameTaken' } }
  }

  await prisma.user.create({
    data: {
      username: data.username,
      passwordHash: await hashPassword(data.password),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      role: data.role as Role,
      active: data.active,
      note: data.note || null,
    },
  })

  revalidatePath('/admin/membres')
  return { status: 'success', message: 'created' }
}

export async function updateMemberAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const data = readMemberForm(formData)
  const fieldErrors: Record<string, string> = {}

  if (!USERNAME_PATTERN.test(data.username)) fieldErrors.username = 'usernameInvalid'
  if (data.password && data.password.length < 8) fieldErrors.password = 'passwordTooShort'
  if (!data.name) fieldErrors.name = 'required'
  if (!data.email) fieldErrors.email = 'required'
  else if (!EMAIL_PATTERN.test(data.email)) fieldErrors.email = 'email'

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'VALIDATION_ERROR', fieldErrors }
  }

  const existing = await prisma.user.findUnique({ where: { username: data.username } })
  if (existing && existing.id !== id) {
    return { status: 'error', message: 'usernameTaken', fieldErrors: { username: 'usernameTaken' } }
  }

  const updateData: Record<string, unknown> = {
    username: data.username,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    role: data.role,
    active: data.active,
    note: data.note || null,
  }

  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password)
  }

  await prisma.user.update({ where: { id }, data: updateData })

  revalidatePath('/admin/membres')
  revalidatePath(`/admin/membres/${id}`)
  void admin

  return { status: 'success', message: 'updated' }
}

export async function deleteMemberAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (id === admin.id) return

  await prisma.user.delete({ where: { id } })
  revalidatePath('/admin/membres')
}

export async function toggleMemberActiveAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (id === admin.id) return

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return

  await prisma.user.update({ where: { id }, data: { active: !user.active } })
  revalidatePath('/admin/membres')
  revalidatePath(`/admin/membres/${id}`)
}

export async function setQuotaAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const userId = String(formData.get('userId') ?? '')
  const schoolYearId = String(formData.get('schoolYearId') ?? '')
  const status = String(formData.get('status') ?? 'PENDING') as MembershipStatus
  const amount = Number.parseInt(String(formData.get('amount') ?? '0'), 10) || 0
  const method = String(formData.get('method') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim()

  if (!userId || !schoolYearId) {
    return { status: 'error', message: 'VALIDATION_ERROR' }
  }

  await prisma.membership.upsert({
    where: { userId_schoolYearId: { userId, schoolYearId } },
    create: {
      userId,
      schoolYearId,
      status,
      amount,
      method: method || null,
      note: note || null,
      paidAt: status === 'PAID' ? new Date() : null,
    },
    update: {
      status,
      amount,
      method: method || null,
      note: note || null,
      paidAt: status === 'PAID' ? new Date() : null,
    },
  })

  revalidatePath(`/admin/membres/${userId}`)
  return { status: 'success', message: 'updated' }
}

export async function changeOwnPasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { status: 'error', message: 'VALIDATION_ERROR' }

  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (newPassword.length < 8) {
    return { status: 'error', message: 'passwordTooShort' }
  }
  if (newPassword !== confirmPassword) {
    return { status: 'error', message: 'passwordMismatch' }
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash)
  if (!valid) {
    return { status: 'error', message: 'invalidCurrentPassword' }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  })

  return { status: 'success', message: 'passwordUpdated' }
}
