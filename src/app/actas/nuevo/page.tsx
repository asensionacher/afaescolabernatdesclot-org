import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MeetingReportForm from '@/components/MeetingReportForm'
import Link from 'next/link'
import styles from './nuevo.module.css'

export const dynamic = 'force-dynamic'

export default async function NuevaActaPage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect('/actas')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/actas" className={styles.backLink}>
          ← Tornar a la llista
        </Link>
        <h1 className={styles.title}>Nova Acta de Reunió</h1>
      </header>

      <MeetingReportForm />
    </div>
  )
}
