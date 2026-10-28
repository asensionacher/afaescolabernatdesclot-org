import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { decryptSecret, encryptSecret } from '@/lib/crypto'

export interface EmailSettings {
  host: string
  port: number
  user: string
  password: string
  secure: boolean
  fromName: string
  fromEmail: string
}

export const EMAIL_SETTING_KEY = 'email'

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  host: '',
  port: 587,
  user: 'afaescolabernatdesclot@gmail.com',
  password: '',
  secure: false,
  fromName: 'AFA Escola Bernat Desclot',
  fromEmail: 'afaescolabernatdesclot@gmail.com',
}

interface StoredEmailSettings {
  host?: string
  port?: number
  user?: string
  passwordEnc?: string
  secure?: boolean
  fromName?: string
  fromEmail?: string
}

/** Lee la configuración de correo (la contraseña se descifra). */
export async function getEmailSettings(): Promise<EmailSettings> {
  const setting = await prisma.setting.findUnique({ where: { key: EMAIL_SETTING_KEY } })
  if (!setting || typeof setting.value !== 'object' || setting.value === null) {
    return { ...DEFAULT_EMAIL_SETTINGS }
  }

  const stored = setting.value as StoredEmailSettings
  let password = ''
  if (stored.passwordEnc) {
    try {
      password = decryptSecret(stored.passwordEnc)
    } catch {
      password = ''
    }
  }

  return {
    host: stored.host ?? DEFAULT_EMAIL_SETTINGS.host,
    port: stored.port ?? DEFAULT_EMAIL_SETTINGS.port,
    user: stored.user ?? DEFAULT_EMAIL_SETTINGS.user,
    password,
    secure: stored.secure ?? DEFAULT_EMAIL_SETTINGS.secure,
    fromName: stored.fromName ?? DEFAULT_EMAIL_SETTINGS.fromName,
    fromEmail: stored.fromEmail ?? DEFAULT_EMAIL_SETTINGS.fromEmail,
  }
}

/** Guarda la configuración de correo (la contraseña se cifra). */
export async function saveEmailSettings(settings: EmailSettings): Promise<void> {
  const value: StoredEmailSettings = {
    host: settings.host,
    port: settings.port,
    user: settings.user,
    passwordEnc: settings.password ? encryptSecret(settings.password) : '',
    secure: settings.secure,
    fromName: settings.fromName,
    fromEmail: settings.fromEmail,
  }

  await prisma.setting.upsert({
    where: { key: EMAIL_SETTING_KEY },
    create: { key: EMAIL_SETTING_KEY, value: value as unknown as Prisma.InputJsonValue },
    update: { value: value as unknown as Prisma.InputJsonValue },
  })
}

/** ¿Hay suficiente configuración para enviar correo? */
export function isEmailConfigured(settings: EmailSettings): boolean {
  return Boolean(settings.host && settings.user && settings.password && settings.fromEmail)
}
