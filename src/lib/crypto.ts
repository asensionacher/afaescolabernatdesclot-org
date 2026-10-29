import crypto from 'node:crypto'
import { DEV_CREDENTIALS_ENCRYPTION_KEY, readSecret } from '@/lib/config'

const ALGORITHM = 'aes-256-gcm'

/** La clave debe ser exactamente 64 caracteres hexadecimales (32 bytes). */
export function isEncryptionKeyValid(): boolean {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY
  if (!raw) return false
  return /^[0-9a-fA-F]{64}$/.test(raw)
}

function getKey(): Buffer {
  const raw = readSecret('CREDENTIALS_ENCRYPTION_KEY', DEV_CREDENTIALS_ENCRYPTION_KEY)
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error(
      'CREDENTIALS_ENCRYPTION_KEY debe ser 64 caracteres hexadecimales (32 bytes). Genera una con: openssl rand -hex 32',
    )
  }
  return Buffer.from(raw, 'hex')
}

/** Cifra un texto con AES-256-GCM. Formato: iv:tag:datos (base64) */
export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

/** Descifra un texto cifrado con encryptSecret. */
export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Valor cifrado inválido')
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}
