'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { localizedValue } from '@/lib/forms'
import { generateSubmissionPdf } from '@/lib/pdf'
import { buildAcceptedEmail, buildDeniedEmail, sendEmail } from '@/lib/email'
import type { ActionState } from './types'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('No autoritzat')
  }
  return user
}

interface StoredAnswer {
  fieldId: string
  label: string
  type: string
  value: string
}

function parseAnswers(value: unknown): StoredAnswer[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (answer): answer is StoredAnswer =>
      Boolean(answer) && typeof answer === 'object' && typeof (answer as StoredAnswer).value === 'string',
  )
}

/** Resuelve los ficheros adjuntos para mostrarlos con su nombre real. */
async function resolveAnswers(answers: StoredAnswer[]): Promise<{ label: string; value: string }[]> {
  const uploadIds = answers.filter((a) => a.type === 'FILE' && a.value).map((a) => a.value)
  const uploads = uploadIds.length
    ? await prisma.upload.findMany({ where: { id: { in: uploadIds } }, select: { id: true, filename: true } })
    : []
  const names = new Map(uploads.map((upload) => [upload.id, upload.filename]))

  return answers.map((answer) => ({
    label: answer.label,
    value: answer.type === 'FILE' ? (names.get(answer.value) ?? '—') : answer.value,
  }))
}

export async function reviewSubmissionAction(
  _previous: ActionState,
  formData: FormData,
  decision: 'ACCEPT' | 'DENY',
): Promise<ActionState> {
  const admin = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const reason = String(formData.get('reason') ?? '').trim()

  if (decision === 'DENY' && !reason) {
    return { status: 'error', message: 'denialReasonRequired', fieldErrors: { reason: 'required' } }
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { form: { include: { schoolYear: true } } },
  })
  if (!submission) {
    return { status: 'error', message: 'notFound' }
  }

  const answers = parseAnswers(submission.answers)

  if (decision === 'ACCEPT') {
    const pdf = generateSubmissionPdf({
      submissionId: submission.id,
      formTitle: localizedValue(submission.form.title, 'ca'),
      schoolYearName: submission.form.schoolYear.name,
      status: 'Acceptada',
      contactName: submission.contactName,
      contactEmail: submission.contactEmail,
      contactPhone: submission.contactPhone,
      priceTierLabel:
        submission.priceTier === 'MEMBER' ? 'Membre amb quota pagada' : 'No membre',
      price: submission.price,
      total: submission.total,
      submittedAt: submission.createdAt,
      reviewedAt: new Date(),
      denialReason: null,
      answers: await resolveAnswers(answers),
    })

    await prisma.submission.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        reviewedAt: new Date(),
        reviewedById: admin.id,
        denialReason: null,
        pdfData: new Uint8Array(pdf),
        pdfFilename: `formulari-${submission.id}.pdf`,
        pdfGeneratedAt: new Date(),
      },
    })

    const message = buildAcceptedEmail({
      formTitle: localizedValue(submission.form.title, 'ca'),
      submissionId: submission.id,
      applicantName: submission.contactName,
      applicantEmail: submission.contactEmail,
      price: submission.price,
      total: submission.total,
    })
    await sendEmail({
      ...message,
      attachments: [
        {
          filename: `formulari-${submission.id}.pdf`,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    })
  } else {
    await prisma.submission.update({
      where: { id },
      data: {
        status: 'DENIED',
        reviewedAt: new Date(),
        reviewedById: admin.id,
        denialReason: reason,
      },
    })

    const message = buildDeniedEmail({
      formTitle: localizedValue(submission.form.title, 'ca'),
      submissionId: submission.id,
      applicantName: submission.contactName,
      applicantEmail: submission.contactEmail,
      price: submission.price,
      total: submission.total,
      denialReason: reason,
    })
    await sendEmail(message)
  }

  revalidatePath('/admin/respostes')
  revalidatePath(`/admin/respostes/${id}`)
  revalidatePath('/el-meu-compte')

  return { status: 'success', message: decision === 'ACCEPT' ? 'acceptedOk' : 'deniedOk' }
}

/** Acepta la respuesta: genera el PDF y envía el correo de aceptación. */
export async function acceptSubmissionAction(
  previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return reviewSubmissionAction(previous, formData, 'ACCEPT')
}

/** Deniega la respuesta: el motivo es obligatorio. */
export async function denySubmissionAction(
  previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return reviewSubmissionAction(previous, formData, 'DENY')
}
