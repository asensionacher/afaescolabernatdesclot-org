import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getMeetingReportById } from '@/lib/sanity'
import MeetingReportForm from '@/components/MeetingReportForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from './editar.module.css'

export const dynamic = 'force-dynamic'

interface EditarActaPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarActaPage({ params }: EditarActaPageProps) {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect('/actas')
  }

  const { id } = await params
  const report = await getMeetingReportById(id)

  if (!report) {
    notFound()
  }

  if (report.status === 'closed') {
    redirect('/actas')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/actas" className={styles.backLink}>
          ← Tornar a la llista
        </Link>
        <h1 className={styles.title}>Editar Acta de Reunió</h1>
      </header>

      <MeetingReportForm initialData={report} isEdit />
    </div>
  )
}
