'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { LOCALES, LOCALE_COOKIE } from '@/i18n/config'
import styles from './LocaleSwitcher.module.css'

const LABELS: Record<string, string> = {
  ca: 'Català',
  es: 'Español',
}

export default function LocaleSwitcher({ locale }: { locale: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function changeLocale(next: string) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className={styles.switcher} role="group" aria-label="Idioma">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={code === locale ? styles.active : styles.option}
          onClick={() => changeLocale(code)}
          disabled={isPending}
          aria-current={code === locale ? 'true' : undefined}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  )
}
