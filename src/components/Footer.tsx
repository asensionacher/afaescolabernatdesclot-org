import Link from 'next/link'
import { getT } from '@/lib/translator'
import styles from './Footer.module.css'

export default async function Footer() {
  const t = await getT()
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.title}>{t('site.name')}</p>
          <p className={styles.text}>{t('footer.madeWith')}</p>
        </div>
        <nav className={styles.nav} aria-label=" Peu de pàgina">
          <Link href="/">{t('nav.home')}</Link>
          <Link href="/login">{t('nav.login')}</Link>
          <Link href="/el-meu-compte">{t('nav.account')}</Link>
        </nav>
        <p className={styles.rights}>{t('footer.rights', { year })}</p>
      </div>
    </footer>
  )
}
