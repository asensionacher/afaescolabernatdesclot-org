import { getLocale, translate } from '@/lib/i18n'
import type { TranslateValues } from '@/lib/i18n'

/** Devuelve un traductor ligado al idioma detectado en la petición actual. */
export async function getT(): Promise<(key: string, values?: TranslateValues) => string> {
  const locale = await getLocale()
  return (key: string, values?: TranslateValues) => translate(locale, key, values)
}
