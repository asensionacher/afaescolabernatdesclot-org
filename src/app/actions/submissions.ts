'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { isFormExpired, parseFields, type FormField } from '@/lib/forms'
import { resolvePrice } from '@/lib/pricing'
import { saveUpload } from '@/lib/uploads'
import { buildReceivedEmail, sendEmail } from '@/lib/email'
import { localizedValue } from '@/lib/forms'

export interface SubmitState {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

export interface StoredAnswer {
  fieldId: string
  label: string
  type: string
  value: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(field: FormField, raw: FormDataEntryValue | null): string | null {
  const value = typeof raw === 'string' ? raw.trim() : ''

  if (field.required && !value) return 'required'
  if (!value) return null

  if (field.type === 'EMAIL' && !EMAIL_PATTERN.test(value)) return 'email'
  if (field.type === 'NUMBER' && Number.isNaN(Number(value))) return 'number'

  return null
}

export async function submitFormAction(
  formId: string,
  _previous: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form || form.status !== 'PUBLISHED') {
    return { status: 'error', message: 'FORM_NOT_AVAILABLE' }
  }

  if (isFormExpired(form)) {
    return { status: 'error', message: 'FORM_EXPIRED' }
  }

  const user = await getCurrentUser()

  // Los formularios privados solo se pueden enviar con sesión iniciada.
  if (form.visibility === 'MEMBERS_ONLY' && !user) {
    return { status: 'error', message: 'LOGIN_REQUIRED' }
  }

  const fields = parseFields(form.fields)
  const fieldErrors: Record<string, string> = {}
  const answers: StoredAnswer[] = []

  const contactName = String(formData.get('contactName') ?? '').trim()
  const contactEmail = String(formData.get('contactEmail') ?? '').trim()
  const contactPhone = String(formData.get('contactPhone') ?? '').trim()

  if (!contactName) fieldErrors.contactName = 'required'
  if (!contactEmail) fieldErrors.contactEmail = 'required'
  else if (!EMAIL_PATTERN.test(contactEmail)) fieldErrors.contactEmail = 'email'

  for (const field of fields) {
    const error = validateField(field, formData.get(`field_${field.id}`))
    if (error) {
      fieldErrors[field.id] = error
      continue
    }

    if (field.type === 'FILE') {
      const file = formData.get(`field_${field.id}`)
      if (file instanceof File && file.size > 0) {
        const saved = await saveUpload(file)
        if ('error' in saved) {
          fieldErrors[field.id] = 'fileTooBig'
          continue
        }
        answers.push({
          fieldId: field.id,
          label: field.label,
          type: field.type,
          value: saved.id,
        })
      }
      continue
    }

    const raw = formData.get(`field_${field.id}`)
    const value = typeof raw === 'string' ? raw.trim() : ''
    answers.push({
      fieldId: field.id,
      label: field.label,
      type: field.type,
      value,
    })
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'VALIDATION_ERROR', fieldErrors }
  }

  const price = await resolvePrice(form, user?.id)

  const submission = await prisma.submission.create({
    data: {
      formId: form.id,
      userId: user?.id ?? null,
      contactName,
      contactEmail,
      contactPhone: contactPhone || null,
      answers: answers as unknown as Prisma.InputJsonValue,
      price: price.price,
      priceTier: price.tier,
      total: price.price,
    },
  })

  // Aviso de formulario recibido.
  const message = buildReceivedEmail({
    formTitle: localizedValue(form.title, 'ca'),
    submissionId: submission.id,
    applicantName: contactName,
    applicantEmail: contactEmail,
    price: price.price,
    total: price.price,
  })
  await sendEmail(message)

  revalidatePath('/admin/respostes')

  return { status: 'success' }
}
