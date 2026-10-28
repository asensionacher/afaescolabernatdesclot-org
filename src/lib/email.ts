import nodemailer from 'nodemailer'
import { getEmailSettings, isEmailConfigured } from '@/lib/settings'
import { formatPrice } from '@/lib/i18n'

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html?: string
  attachments?: { filename: string; content: Buffer; contentType?: string }[]
}

export interface EmailResult {
  sent: boolean
  error?: string
}

/** Envía un correo con la configuración SMTP guardada en el panel de admin. */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const settings = await getEmailSettings()

  if (!isEmailConfigured(settings)) {
    console.warn('[email] SMTP no configurado. No se ha enviado:', message.subject)
    return { sent: false, error: 'SMTP_NOT_CONFIGURED' }
  }

  try {
    const transport = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: { user: settings.user, pass: settings.password },
    })

    await transport.sendMail({
      from: { name: settings.fromName, address: settings.fromEmail },
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments,
    })

    return { sent: true }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error('[email] Error enviando correo:', detail)
    return { sent: false, error: detail }
  }
}

interface SubmissionEmailData {
  formTitle: string
  submissionId: string
  applicantName: string
  applicantEmail: string
  price: number
  total: number
  denialReason?: string | null
}

/** Aviso de formulario recibido. */
export function buildReceivedEmail(data: SubmissionEmailData): EmailMessage {
  const subject = `AFA Bernat Desclot · Formulari rebut: ${data.formTitle}`
  const text = [
    `Hola ${data.applicantName},`,
    '',
    `Hem rebut el teu formulari «${data.formTitle}».`,
    `El preu aplicable és de ${formatPrice(data.price, 'ca')}.`,
    '',
    "L'AFA el revisarà i t'avisarà per aquest correu quan l'accepti o el denegui.",
    '',
    `Referència: ${data.submissionId}`,
  ].join('\n')

  return { to: data.applicantEmail, subject, text }
}

/** Aviso de formulario aceptado. */
export function buildAcceptedEmail(data: SubmissionEmailData): EmailMessage {
  const subject = `AFA Bernat Desclot · Formulari acceptat: ${data.formTitle}`
  const text = [
    `Hola ${data.applicantName},`,
    '',
    `El teu formulari «${data.formTitle}» ha estat ACCEPTAT.`,
    `Import a pagar: ${formatPrice(data.total, 'ca')}.`,
    '',
    "S'adjunta el PDF amb les dades del formulari.",
    '',
    `Referència: ${data.submissionId}`,
  ].join('\n')

  return { to: data.applicantEmail, subject, text }
}

/** Aviso de formulario denegado (el motivo es obligatorio). */
export function buildDeniedEmail(data: SubmissionEmailData): EmailMessage {
  const subject = `AFA Bernat Desclot · Formulari denegat: ${data.formTitle}`
  const text = [
    `Hola ${data.applicantName},`,
    '',
    `El teu formulari «${data.formTitle}» ha estat DENEGAT.`,
    '',
    'Motiu:',
    data.denialReason ?? '',
    '',
    'Si creus que hi ha hagut un error, respon aquest correu i ho revisarem.',
    '',
    `Referència: ${data.submissionId}`,
  ].join('\n')

  return { to: data.applicantEmail, subject, text }
}
