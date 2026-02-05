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
      if (!response.ok) throw new Error('Error al cargar los partes')
      const data = await response.json()
      setReports(data)
    } catch (err) {
      setError('Error al cargar los partes')
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
    if (!confirm('¿Estás seguro de que quieres eliminar este parte?')) return

    try {
      const response = await fetch(`/api/meeting-reports/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Error al eliminar')
      
      await fetchReports()
    } catch (err) {
      alert('Error al eliminar el parte')
      console.error(err)
    }
  }

  const handleClose = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres cerrar este parte? No podrás editarlo después.')) return

    try {
      const response = await fetch(`/api/meeting-reports/${id}/close`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Error al cerrar')
      
      await fetchReports()
    } catch (err) {
      alert('Error al cerrar el parte')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Partes de Reunión</h1>
        <div className={styles.actions}>
          <Link href="/partes/nuevo" className={styles.buttonPrimary}>
            + Nuevo Parte
          </Link>
          <button onClick={handleLogout} className={styles.buttonSecondary}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        {reports.length === 0 ? (
          <div className={styles.empty}>
            <p>No hay partes de reunión todavía.</p>
            <Link href="/partes/nuevo" className={styles.buttonPrimary}>
              Crear el primero
            </Link>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{report.title}</h2>
                <span className={`${styles.badge} ${styles[report.status]}`}>
                  {report.status === 'draft' ? '📝 Borrador' : '✅ Cerrado'}
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
                  {report.attendees.length} asistente{report.attendees.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className={styles.cardFooter}>
                <a
                  href={`/api/meeting-reports/${report._id}/pdf`}
                  className={styles.buttonSmall}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Descargar PDF
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
                      🔒 Cerrar
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
