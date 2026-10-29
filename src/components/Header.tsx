import Image from 'next/image'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getLocale } from '@/lib/i18n'
import { getT } from '@/lib/translator'
import { logoutAction } from '@/app/actions/auth'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import NavLink from '@/components/NavLink'
import styles from './Header.module.css'

export default async function Header() {
  const t = await getT()
  const locale = await getLocale()
  const user = await getCurrentUser()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/logo-small.png"
            alt="AFA Bernat Desclot"
            width={48}
            height={48}
            priority
          />
          <span className={styles.brandText}>
            <strong>{t('site.short')}</strong>
            <span className={styles.brandTagline}>{t('site.tagline')}</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label={t('nav.main')}>
          <NavLink href="/">{t('nav.forms')}</NavLink>
          {user ? (
            <>
              <NavLink href="/el-meu-compte">{t('nav.account')}</NavLink>
              {user.role === 'ADMIN' && (
                <NavLink href="/admin" className={styles.adminLink}>
                  {t('nav.admin')}
                </NavLink>
              )}
            </>
          ) : null}
        </nav>

        <div className={styles.actions}>
          <LocaleSwitcher locale={locale} label={t('nav.language')} />
          {user ? (
            <form action={logoutAction}>
              <button type="submit" className={styles.logout}>
                {t('nav.logout')}
              </button>
            </form>
          ) : (
            <Link href="/login" className={styles.accountButton}>
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
