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
  const [creatingTest, setCreatingTest] = useState(false)
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      // Add timestamp to prevent caching
      const response = await fetch('/api/meeting-minutes?t=' + Date.now(), {
        cache: 'no-store'
      })
      if (!response.ok) throw new Error('Error en carregar les actes')
      const data = await response.json()
      setReports(data)
    } catch (err) {
      setError('Error en carregar les actes')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Estàs segur que vols eliminar aquesta acta?")) return

    try {
      const response = await fetch(`/api/meeting-minutes/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Error en eliminar')
      
      await fetchReports()
    } catch (err) {
      alert("Error en eliminar l'acta")
    }
  }

  const handleClose = async (id: string) => {
    if (!confirm("Estàs segur que vols tancar aquesta acta? No podràs editar-la després.")) return

    try {
      const response = await fetch(`/api/meeting-minutes/${id}/close`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Error en tancar')
      
      await fetchReports()
    } catch (err) {
      alert("Error en tancar l'acta")
    }
  }

  const createTestReport = async () => {
    if (!confirm('🧪 Crear una acta de prova?')) return

    setCreatingTest(true)
    try {
      const testData = {
        title: 'Reunió Extraordinària de l\'AMPA',
        meetingDate: new Date().toISOString(),
        attendees: [
          {
            _key: 'attendee-' + Math.random().toString(36).substr(2, 9),
            studentName: 'Maria García López',
            course: '1er ESO',
            attendantName: 'Pere García'
          },
          {
            _key: 'attendee-' + Math.random().toString(36).substr(2, 9),
            studentName: 'Joan Martínez Sánchez',
            course: '2on ESO',
            attendantName: 'Anna Martínez'
          },
          {
            _key: 'attendee-' + Math.random().toString(36).substr(2, 9),
            studentName: 'Laura Fernández Vila',
            course: '3er ESO',
            attendantName: 'Carles Fernández'
          }
        ],
        content: '<p><strong>Ordre del dia:</strong></p><ol><li>Benvinguda i presentació</li><li>Proposta de activitats extraescolars</li><li>Aprovació del pressupost</li></ol><p><br></p><p><strong>Desenvolupament:</strong></p><p>S\'obre la sessió amb l\'assistència dels familiars presents. Es presenten les propostes d\'activitats per al proper trimestre, incloent excursions educatives i tallers culturals.</p><p><br></p><p><em>Es debat sobre les opcions presentades i s\'arriba a un consens sobre les prioritats.</em></p><p><br></p><p><u>Acords presos:</u></p><ul><li>Aprovar el pressupost de 2.500€ per activitats</li><li>Organitzar visita al museu el proper mes</li><li>Crear comissió per gestionar tallers</li></ul>',
        signerName: 'Elena Gómez Ruiz',
        signerRole: 'Vicepresidenta AMPA'
      }

      const response = await fetch('/api/meeting-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Error al crear acta de prova')
      }

      alert('✅ Acta de prova creada correctament!')
      
      // Wait a moment for Sanity to sync, then refresh
      setTimeout(async () => {
        await fetchReports()
      }, 500)
    } catch (err) {
      alert('❌ Error al crear l\'acta de prova: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setCreatingTest(false)
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
        <h1 className={styles.title}>Actes de Reunió</h1>
        <div className={styles.actions}>
          {isDevelopment && (
            <button 
              onClick={createTestReport} 
              className={styles.buttonSecondary}
              disabled={creatingTest}
              style={{ 
                backgroundColor: '#9C27B0', 
                borderColor: '#9C27B0',
                opacity: creatingTest ? 0.6 : 1 
              }}
            >
              {creatingTest ? '🧪 Creant...' : '🧪 Acta de Prova'}
            </button>
          )}
          <Link href="/actas/nuevo" className={styles.buttonPrimary}>
            + Nova Acta
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
            <p>No hi ha actes de reunió encara.</p>
            <Link href="/actas/nuevo" className={styles.buttonPrimary}>
              Crear la primera
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
                <p className={styles.date}>
                  {new Date(report.meetingDate).toLocaleDateString('ca-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className={styles.attendees}>
                  {report.attendees.length} assistent{report.attendees.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className={styles.cardFooter}>
                <a
                  href={`/api/meeting-minutes/${report._id}/pdf`}
                  className={styles.buttonSmall}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Descarregar PDF
                </a>
                
                {report.status === 'draft' && (
                  <>
                    <Link
                      href={`/actas/${report._id}/editar`}
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
