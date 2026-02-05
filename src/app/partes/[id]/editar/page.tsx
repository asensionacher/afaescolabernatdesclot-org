import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getMeetingReportById } from '@/lib/sanity'
import MeetingReportForm from '@/components/MeetingReportForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from './editar.module.css'

export const dynamic = 'force-dynamic'

interface EditarPartePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarPartePage({ params }: EditarPartePageProps) {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect('/partes')
  }

  const { id } = await params
  const report = await getMeetingReportById(id)

  if (!report) {
    notFound()
  }

  if (report.status === 'closed') {
    redirect('/partes')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/partes" className={styles.backLink}>
          ← Tornar a la llista
        </Link>
        <h1 className={styles.title}>Editar Parte de Reunió</h1>
      </header>

      <MeetingReportForm initialData={report} isEdit />
    </div>
  )
}
