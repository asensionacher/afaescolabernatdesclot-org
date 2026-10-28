'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { eurosToCents } from '@/lib/forms'
import type { ActionState } from './types'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('No autoritzat')
  }
  return user
}

function readYearForm(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const startDate = String(formData.get('startDate') ?? '').trim()
  const endDate = String(formData.get('endDate') ?? '').trim()
  const quotaAmount = eurosToCents(String(formData.get('quotaAmount') ?? ''))
  const isCurrent = formData.get('isCurrent') === 'on' || formData.get('isCurrent') === 'true'
  return { name, startDate, endDate, quotaAmount, isCurrent }
}

export async function createSchoolYearAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const data = readYearForm(formData)
  const fieldErrors: Record<string, string> = {}

  if (!data.name) fieldErrors.name = 'required'
  if (!data.startDate) fieldErrors.startDate = 'required'
  if (!data.endDate) fieldErrors.endDate = 'required'
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    fieldErrors.endDate = 'invalidRange'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'VALIDATION_ERROR', fieldErrors }
  }

  const existing = await prisma.schoolYear.findUnique({ where: { name: data.name } })
  if (existing) {
    return { status: 'error', message: 'nameTaken', fieldErrors: { name: 'nameTaken' } }
  }

  await prisma.$transaction(async (tx) => {
    if (data.isCurrent) {
      await tx.schoolYear.updateMany({ data: { isCurrent: false } })
    }
    await tx.schoolYear.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        quotaAmount: data.quotaAmount,
        isCurrent: data.isCurrent,
      },
    })
  })

  revalidatePath('/admin/anys-escolars')
  return { status: 'success', message: 'created' }
}

export async function updateSchoolYearAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const data = readYearForm(formData)
  const fieldErrors: Record<string, string> = {}

  if (!data.name) fieldErrors.name = 'required'
  if (!data.startDate) fieldErrors.startDate = 'required'
  if (!data.endDate) fieldErrors.endDate = 'required'
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    fieldErrors.endDate = 'invalidRange'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'VALIDATION_ERROR', fieldErrors }
  }

  const existing = await prisma.schoolYear.findUnique({ where: { name: data.name } })
  if (existing && existing.id !== id) {
    return { status: 'error', message: 'nameTaken', fieldErrors: { name: 'nameTaken' } }
  }

  await prisma.$transaction(async (tx) => {
    if (data.isCurrent) {
      await tx.schoolYear.updateMany({ data: { isCurrent: false } })
    }
    await tx.schoolYear.update({
      where: { id },
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        quotaAmount: data.quotaAmount,
        isCurrent: data.isCurrent,
      },
    })
  })

  revalidatePath('/admin/anys-escolars')
  return { status: 'success', message: 'updated' }
}

export async function setCurrentSchoolYearAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')

  await prisma.$transaction(async (tx) => {
    await tx.schoolYear.updateMany({ data: { isCurrent: false } })
    await tx.schoolYear.update({ where: { id }, data: { isCurrent: true } })
  })

  revalidatePath('/admin/anys-escolars')
  revalidatePath('/')
}

export async function deleteSchoolYearAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  await prisma.schoolYear.delete({ where: { id } })
  revalidatePath('/admin/anys-escolars')
}
