'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { logout } from '@/lib/auth'
import type { MeetingReport } from '@/lib/sanity'
import styles from './MeetingReportsList.module.css'

export default function MeetingReportsList() {
  const [reports, setReports] = useState<MeetingReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/meeting-reports')
      if (!response.ok) throw new Error('Error en carregar els partes')
      const data = await response.json()
      setReports(data)
    } catch (err) {
      setError('Error en carregar els partes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Estàs segur que vols eliminar aquest parte?')) return

    try {
      const response = await fetch(`/api/meeting-reports/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Error en eliminar')
      
      await fetchReports()
    } catch (err) {
      alert('Error en eliminar el parte')
      console.error(err)
    }
  }

  const handleClose = async (id: string) => {
    if (!confirm('Estàs segur que vols tancar aquest parte? No podràs editar-lo després.')) return

    try {
      const response = await fetch(`/api/meeting-reports/${id}/close`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Error en tancar')
      
      await fetchReports()
    } catch (err) {
      alert('Error en tancar el parte')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregant...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Partes de Reunió</h1>
        <div className={styles.actions}>
          <Link href="/partes/nuevo" className={styles.buttonPrimary}>
            + Nou Parte
          </Link>
          <button onClick={handleLogout} className={styles.buttonSecondary}>
            Tancar Sessió
          </button>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        {reports.length === 0 ? (
          <div className={styles.empty}>
            <p>No hi ha partes de reunió encara.</p>
            <Link href="/partes/nuevo" className={styles.buttonPrimary}>
              Crear el primer
            </Link>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{report.title}</h2>
                <span className={`${styles.badge} ${styles[report.status]}`}>
                  {report.status === 'draft' ? '📝 Esborrany' : '✅ Tancat'}
                </span>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.location}>{report.location}</p>
                <p className={styles.date}>
                  {new Date(report.meetingDate).toLocaleDateString('ca-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })} - {report.meetingTime}
                </p>
                <p className={styles.place}>{report.meetingPlace}</p>
                <p className={styles.attendees}>
                  {report.attendees.length} assistent{report.attendees.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className={styles.cardFooter}>
                <a
                  href={`/api/meeting-reports/${report._id}/pdf`}
                  className={styles.buttonSmall}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Descarregar PDF
                </a>
                
                {report.status === 'draft' && (
                  <>
                    <Link
                      href={`/partes/${report._id}/editar`}
                      className={styles.buttonSmall}
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      onClick={() => handleClose(report._id)}
                      className={styles.buttonSmall}
                    >
                      🔒 Tancar
                    </button>
                    <button
                      onClick={() => handleDelete(report._id)}
                      className={`${styles.buttonSmall} ${styles.danger}`}
                    >
                      🗑️ Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
