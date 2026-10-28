import { cookies, headers } from 'next/headers'
import { ca, es } from '@/i18n/messages'
import type { Dictionary } from '@/i18n/messages'
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  detectLocale,
  isLocale,
  type Locale,
} from '@/i18n/config'

export { DEFAULT_LOCALE, LOCALE_COOKIE, detectLocale, isLocale }
export type { Locale }

const DICTIONARIES: Record<Locale, Dictionary> = { ca, es }

/**
 * Idioma activo. Prioridad: cookie guardada > cabecera del navegador > catalán.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const saved = cookieStore.get(LOCALE_COOKIE)?.value
  if (saved && isLocale(saved)) return saved

  const headerStore = await headers()
  return detectLocale(headerStore.get('accept-language'))
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}

export type TranslateValues = Record<string, string | number>

/** Resuelve una clave con notación de punto: 'home.formsForYear'. */
export function translate(locale: Locale, key: string, values?: TranslateValues): string {
  const dictionary = getDictionary(locale) as unknown as Record<string, unknown>
  const path = key.split('.')
  let current: unknown = dictionary

  for (const segment of path) {
    if (typeof current !== 'object' || current === null) return key
    current = (current as Record<string, unknown>)[segment]
  }

  if (typeof current !== 'string') return key

  if (!values) return current

  return current.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name]
    return value === undefined ? match : String(value)
  })
}

/** Formatea un precio en euros (los importes se guardan en céntimos). */
export function formatPrice(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

/** Formatea una fecha corta (dd/mm/aaaa). */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

/** Formatea fecha y hora. */
export function formatDateTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
