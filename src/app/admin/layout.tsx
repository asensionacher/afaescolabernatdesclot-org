import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { getT } from '@/lib/translator'
import styles from './layout.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  const t = await getT()

  const items = [
    { href: '/admin', label: t('admin.dashboard') },
    { href: '/admin/membres', label: t('admin.members') },
    { href: '/admin/anys-escolars', label: t('admin.schoolYears') },
    { href: '/admin/formularis', label: t('admin.forms') },
    { href: '/admin/respostes', label: t('admin.submissions') },
    { href: '/admin/configuracio', label: t('admin.settings') },
  ]

  return (
    <div className="container">
      <div className={styles.header}>
        <div>
          <h1 className="pageTitle">{t('admin.title')}</h1>
          <p className={styles.user}>
            {admin.name} · <strong>{admin.username}</strong>
          </p>
        </div>
      </div>

      <nav className={styles.nav} aria-label={t('admin.title')}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navItem}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.content}>{children}</div>
    </div>
  )
}
