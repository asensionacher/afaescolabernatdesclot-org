import Image from 'next/image'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getLocale } from '@/lib/i18n'
import { getT } from '@/lib/translator'
import { logoutAction } from '@/app/actions/auth'
import LocaleSwitcher from './LocaleSwitcher'
import styles from './Header.module.css'

export default async function Header() {
  const t = await getT()
  const locale = await getLocale()
  const user = await getCurrentUser()

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/logo-small.png"
            alt="AFA Bernat Desclot"
            width={44}
            height={44}
            priority
          />
          <span className={styles.brandText}>
            <strong>{t('site.short')}</strong>
            <span className={styles.brandTagline}>{t('site.tagline')}</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          <Link href="/">{t('nav.home')}</Link>
          <Link href="/#formularis">{t('nav.forms')}</Link>
          {user ? (
            <>
              <Link href="/el-meu-compte">{t('nav.account')}</Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className={styles.adminLink}>
                  {t('nav.admin')}
                </Link>
              )}
            </>
          ) : (
            <Link href="/login">{t('nav.login')}</Link>
          )}
        </nav>

        <div className={styles.actions}>
          <LocaleSwitcher locale={locale} />
          {user ? (
            <form action={logoutAction}>
              <button type="submit" className={styles.logout}>
                {t('nav.logout')}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  )
}
