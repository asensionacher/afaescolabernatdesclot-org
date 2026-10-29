'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { eurosToCents, parseFields, slugify } from '@/lib/forms'
import type { FormStatus, FormVisibility } from '@prisma/client'
import type { ActionState } from './types'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('No autoritzat')
  }
  return user
}

interface FormInput {
  id: string
  slug: string
  titleCa: string
  titleEs: string
  descriptionCa: string
  descriptionEs: string
  noticeCa: string
  noticeEs: string
  schoolYearId: string
  visibility: FormVisibility
  status: FormStatus
  memberPrice: number
  nonMemberPrice: number
  publishedAt: string
  closesAt: string
  pinned: boolean
  fields: unknown
}

function readFormInput(formData: FormData): FormInput {
  const status = String(formData.get('status') ?? 'DRAFT')
  const visibility = String(formData.get('visibility') ?? 'PUBLIC')

  return {
    id: String(formData.get('id') ?? ''),
    slug: String(formData.get('slug') ?? '').trim(),
    titleCa: String(formData.get('titleCa') ?? '').trim(),
    titleEs: String(formData.get('titleEs') ?? '').trim(),
    descriptionCa: String(formData.get('descriptionCa') ?? '').trim(),
    descriptionEs: String(formData.get('descriptionEs') ?? '').trim(),
    noticeCa: String(formData.get('noticeCa') ?? '').trim(),
    noticeEs: String(formData.get('noticeEs') ?? '').trim(),
    schoolYearId: String(formData.get('schoolYearId') ?? ''),
    visibility: visibility === 'MEMBERS_ONLY' ? 'MEMBERS_ONLY' : 'PUBLIC',
    status: status === 'PUBLISHED' || status === 'ARCHIVED' ? status : 'DRAFT',
    memberPrice: eurosToCents(String(formData.get('memberPrice') ?? '')),
    nonMemberPrice: eurosToCents(String(formData.get('nonMemberPrice') ?? '')),
    publishedAt: String(formData.get('publishedAt') ?? '').trim(),
    closesAt: String(formData.get('closesAt') ?? '').trim(),
    pinned: formData.get('pinned') === 'on' || formData.get('pinned') === 'true',
    fields: JSON.parse(String(formData.get('fields') ?? '[]')),
  }
}

function buildPayload(input: FormInput) {
  const fields = parseFields(input.fields).filter((field) => field.label.trim().length > 0)

  return {
    slug: input.slug || slugify(input.titleCa),
    title: { ca: input.titleCa, es: input.titleEs },
    description: { ca: input.descriptionCa, es: input.descriptionEs },
    notice: { ca: input.noticeCa, es: input.noticeEs },
    schoolYearId: input.schoolYearId,
    visibility: input.visibility,
    status: input.status,
    memberPrice: input.memberPrice,
    nonMemberPrice: input.nonMemberPrice,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
    closesAt: input.closesAt ? new Date(input.closesAt) : null,
    pinned: input.pinned,
    fields: fields as unknown as object,
  }
}

export async function saveFormAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin()
  const fieldErrors: Record<string, string> = {}

  let input: FormInput
  try {
    input = readFormInput(formData)
  } catch {
    return { status: 'error', message: 'invalidFields', fieldErrors: { fields: 'invalidFields' } }
  }

  if (!input.titleCa) fieldErrors.titleCa = 'titleRequired'
  if (!input.schoolYearId) fieldErrors.schoolYearId = 'required'

  const fields = parseFields(input.fields).filter((field) => field.label.trim().length > 0)
  if (fields.length === 0) fieldErrors.fields = 'atLeastOneField'

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'VALIDATION_ERROR', fieldErrors }
  }

  const payload = buildPayload(input)

  const slugOwner = await prisma.form.findUnique({ where: { slug: payload.slug } })
  if (slugOwner && slugOwner.id !== input.id) {
    // Si el identificador se ha generado solo a partir del título, se prueba con
    // suffijos numéricos para no bloquear al administrador.
    if (!input.slug) {
      let candidate = payload.slug
      let suffix = 2
      while (slugOwner && suffix < 100) {
        candidate = `${payload.slug}-${suffix}`
        const existing = await prisma.form.findUnique({ where: { slug: candidate } })
        if (!existing || existing.id === input.id) {
          payload.slug = candidate
          break
        }
        suffix += 1
      }
    } else {
      return { status: 'error', message: 'slugTaken', fieldErrors: { slug: 'slugTaken' } }
    }
  }

  if (input.id) {
    await prisma.form.update({
      where: { id: input.id },
      data: {
        ...payload,
        publishedAt:
          payload.status === 'PUBLISHED' && !payload.publishedAt ? new Date() : payload.publishedAt,
      },
    })
  } else {
    const created = await prisma.form.create({
      data: {
        ...payload,
        createdById: admin.id,
        publishedAt: payload.status === 'PUBLISHED' ? payload.publishedAt ?? new Date() : payload.publishedAt,
      },
    })

    revalidatePath('/admin/formularis')
    revalidatePath('/')
    redirect(`/admin/formularis/${created.id}`)
  }

  revalidatePath('/admin/formularis')
  revalidatePath('/')
  return { status: 'success', message: input.id ? 'updated' : 'created' }
}

export async function publishFormAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const form = await prisma.form.findUnique({ where: { id } })
  if (!form) return

  await prisma.form.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: form.publishedAt ?? new Date(),
    },
  })

  revalidatePath('/admin/formularis')
  revalidatePath('/')
}

export async function unpublishFormAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  await prisma.form.update({ where: { id }, data: { status: 'DRAFT' } })
  revalidatePath('/admin/formularis')
  revalidatePath('/')
}

export async function togglePinnedAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const form = await prisma.form.findUnique({ where: { id } })
  if (!form) return

  await prisma.form.update({ where: { id }, data: { pinned: !form.pinned } })
  revalidatePath('/admin/formularis')
  revalidatePath('/')
}

export async function deleteFormAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  await prisma.form.delete({ where: { id } })
  revalidatePath('/admin/formularis')
  revalidatePath('/')
}
