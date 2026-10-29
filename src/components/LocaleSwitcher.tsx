'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { LOCALES, LOCALE_COOKIE } from '@/i18n/config'
import styles from './LocaleSwitcher.module.css'

const LABELS: Record<string, string> = {
  ca: 'Català',
  es: 'Español',
}

export default function LocaleSwitcher({ locale, label }: { locale: string; label: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState(locale)

  useEffect(() => {
    setSelected(locale)
  }, [locale])

  function changeLocale(next: string) {
    setSelected(next)
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className={styles.switcher}>
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
      <select
        className={styles.select}
        value={selected}
        onChange={(event) => changeLocale(event.target.value)}
        disabled={isPending}
        aria-label={label}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} lang={code}>
            {LABELS[code]}
          </option>
        ))}
      </select>
      <svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="m6 9 6 6 6-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
