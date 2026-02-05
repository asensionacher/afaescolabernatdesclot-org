import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MeetingReportForm from '@/components/MeetingReportForm'
import Link from 'next/link'
import styles from './nuevo.module.css'

export const dynamic = 'force-dynamic'

export default async function NuevoPartePage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect('/partes')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/partes" className={styles.backLink}>
          ← Volver a la lista
        </Link>
        <h1 className={styles.title}>Nuevo Parte de Reunión</h1>
      </header>

      <MeetingReportForm />
    </div>
  )
}
