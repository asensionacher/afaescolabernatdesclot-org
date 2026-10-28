import Link from 'next/link'
import { getT } from '@/lib/translator'
import styles from './not-found.module.css'

export default async function NotFound() {
  const t = await getT()

  return (
    <div className={`containerNarrow ${styles.wrapper}`}>
      <p className={styles.code}>404</p>
      <h1 className="pageTitle">{t('common.nothingHere')}</h1>
      <p className="muted">Aquesta pàgina no existeix o ha canviat.</p>
      <Link href="/" className="btn">
        {t('nav.home')}
      </Link>
    </div>
  )
}
