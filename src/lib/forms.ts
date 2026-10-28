import type { FormStatus, FormVisibility } from '@prisma/client'

export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'EMAIL'
  | 'PHONE'
  | 'NUMBER'
  | 'DATE'
  | 'SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'FILE'

export const FORM_FIELD_TYPES: FormFieldType[] = [
  'TEXT',
  'TEXTAREA',
  'EMAIL',
  'PHONE',
  'NUMBER',
  'DATE',
  'SELECT',
  'RADIO',
  'CHECKBOX',
  'FILE',
]

export const FORM_FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  TEXT: 'Text curt',
  TEXTAREA: 'Text llarg',
  EMAIL: 'Correu electrònic',
  PHONE: 'Telèfon',
  NUMBER: 'Número',
  DATE: 'Data',
  SELECT: 'Llista desplegable',
  RADIO: 'Botons d’opció',
  CHECKBOX: 'Casella de marca',
  FILE: 'Adjuntar fitxer',
}

export interface FormField {
  id: string
  label: string
  labelEs?: string
  type: FormFieldType
  required: boolean
  help?: string
  placeholder?: string
  options?: string[]
}

export interface LocalizedText {
  ca?: string
  es?: string
}

export interface FormLike {
  id: string
  slug: string
  title: unknown
  description: unknown
  notice: unknown
  visibility: FormVisibility
  status: FormStatus
  memberPrice: number
  nonMemberPrice: number
  publishedAt: Date | null
  closesAt: Date | null
  pinned: boolean
}

/** Normaliza el valor JSON de un campo de texto traducible. */
export function parseLocalized(value: unknown): LocalizedText {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    const result: LocalizedText = {}
    if (typeof record.ca === 'string') result.ca = record.ca
    if (typeof record.es === 'string') result.es = record.es
    return result
  }
  if (typeof value === 'string') return { ca: value }
  return {}
}

/** Devuelve el texto en el idioma pedido, con reserva al catalán y al primer idioma disponible. */
export function localizedValue(value: unknown, locale: string): string {
  const text = parseLocalized(value)
  if (locale === 'es' && text.es && text.es.trim()) return text.es
  if (text.ca && text.ca.trim()) return text.ca
  if (text.es && text.es.trim()) return text.es
  return ''
}

/** Traducción de un campo del formulario (etiqueta), con reserva al catalán. */
export function fieldLabel(field: FormField, locale: string): string {
  if (locale === 'es' && field.labelEs && field.labelEs.trim()) return field.labelEs
  return field.label
}

/** Normaliza la definición de campos guardada en la base de datos. */
export function parseFields(value: unknown): FormField[] {
  if (!Array.isArray(value)) return []
  const fields: FormField[] = []

  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const record = raw as Record<string, unknown>
    const id = typeof record.id === 'string' && record.id ? record.id : `field_${fields.length + 1}`
    const type = FORM_FIELD_TYPES.includes(record.type as FormFieldType)
      ? (record.type as FormFieldType)
      : 'TEXT'

    fields.push({
      id,
      label: typeof record.label === 'string' ? record.label : '',
      labelEs: typeof record.labelEs === 'string' ? record.labelEs : undefined,
      type,
      required: record.required === true,
      help: typeof record.help === 'string' ? record.help : undefined,
      placeholder: typeof record.placeholder === 'string' ? record.placeholder : undefined,
      options: Array.isArray(record.options)
        ? record.options.filter((option): option is string => typeof option === 'string')
        : undefined,
    })
  }

  return fields
}

export function isFormExpired(form: Pick<FormLike, 'closesAt'>, now: Date = new Date()): boolean {
  if (!form.closesAt) return false
  return new Date(form.closesAt).getTime() < now.getTime()
}

export function isFormOpen(form: FormLike, now: Date = new Date()): boolean {
  return form.status === 'PUBLISHED' && !isFormExpired(form, now)
}

/** ¿Puede este usuario rellenar el formulario? */
export function canSubmitForm(
  form: Pick<FormLike, 'visibility' | 'status' | 'closesAt'>,
  isLoggedIn: boolean,
  now: Date = new Date(),
): boolean {
  if (!isLoggedIn) return false
  if (form.status !== 'PUBLISHED') return false
  if (isFormExpired(form, now)) return false
  if (form.visibility === 'MEMBERS_ONLY' && !isLoggedIn) return false
  return true
}

/**
 * Orden del listado: primero los anclados, luego los más nuevos.
 * Los formularios caducados se van siempre al final.
 */
export function sortFormsForListing<T extends FormLike>(forms: T[], now: Date = new Date()): T[] {
  return [...forms].sort((a, b) => {
    const aExpired = isFormExpired(a, now)
    const bExpired = isFormExpired(b, now)
    if (aExpired !== bExpired) return aExpired ? 1 : -1
    if (!aExpired && a.pinned !== b.pinned) return a.pinned ? -1 : 1
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return bTime - aTime
  })
}

/** Convierte un texto en un identificador de URL. */
export function slugify(text: string): string {
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'formulari'
  )
}

/** Precio en céntimos a partir de un valor en euros escrito en el formulario. */
export function eurosToCents(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const normalized = String(value).replace(/\s/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  if (Number.isNaN(parsed)) return 0
  return Math.round(parsed * 100)
}

export function centsToEuros(cents: number): string {
  return (cents / 100).toFixed(2)
}
