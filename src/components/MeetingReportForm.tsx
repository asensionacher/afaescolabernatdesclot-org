'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { MeetingReport, Attendee } from '@/lib/sanity'
import styles from './MeetingReportForm.module.css'
import 'react-quill/dist/quill.snow.css'

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface MeetingReportFormProps {
  initialData?: MeetingReport
  isEdit?: boolean
}

export default function MeetingReportForm({ initialData, isEdit = false }: MeetingReportFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    meetingDate: initialData?.meetingDate ? initialData.meetingDate.split('T')[0] : '',
    content: initialData?.content || '',
    signerName: initialData?.signerName || '',
    signerRole: initialData?.signerRole || '',
  })

  const [attendees, setAttendees] = useState<Attendee[]>(
    initialData?.attendees || [{ studentName: '', course: '', attendantName: '' }]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }))
  }

  const handleAttendeeChange = (index: number, field: keyof Attendee, value: string) => {
    const newAttendees = [...attendees]
    newAttendees[index] = { ...newAttendees[index], [field]: value }
    setAttendees(newAttendees)
  }

  const addAttendee = () => {
    setAttendees([...attendees, { studentName: '', course: '', attendantName: '' }])
  }

  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        meetingDate: new Date(formData.meetingDate).toISOString(),
        attendees: attendees.filter(
          (a) => a.studentName.trim() && a.course.trim() && a.attendantName.trim()
        ),
      }

      const url = isEdit ? `/api/meeting-reports/${initialData?._id}` : '/api/meeting-reports'
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error en guardar')
      }

      router.push('/partes')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en guardar el parte')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  }

  const quillFormats = [
    'bold', 'italic', 'underline',
    'list', 'bullet'
  ]

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Informació bàsica</h2>

        <div className={styles.field}>
          <label className={styles.label}>
            Títol de la reunió <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ex: REUNIÓ PROPOSTES I VOTACIÓ DISFRESSA"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Data de la reunió <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="meetingDate"
            value={formData.meetingDate}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Assistents</h2>
        
        {attendees.map((attendee, index) => (
          <div key={index} className={styles.attendeeCard}>
            <div className={styles.attendeeHeader}>
              <span className={styles.attendeeNumber}>Assistent {index + 1}</span>
              {attendees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttendee(index)}
                  className={styles.removeButton}
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Nom de l'alumne/a</label>
                <input
                  type="text"
                  value={attendee.studentName}
                  onChange={(e) => handleAttendeeChange(index, 'studentName', e.target.value)}
                  className={styles.input}
                  placeholder="Ex: Raul Lucas Asensio"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Curs</label>
                <input
                  type="text"
                  value={attendee.course}
                  onChange={(e) => handleAttendeeChange(index, 'course', e.target.value)}
                  className={styles.input}
                  placeholder="Ex: 1er I i3"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nom de l'assistent</label>
              <input
                type="text"
                value={attendee.attendantName}
                onChange={(e) => handleAttendeeChange(index, 'attendantName', e.target.value)}
                className={styles.input}
                placeholder="Ex: Arianna Vila Rosales"
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={addAttendee} className={styles.addButton}>
          + Afegir assistent
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contingut de la reunió</h2>

        <div className={styles.field}>
          <label className={styles.label}>
            Contingut <span className={styles.required}>*</span>
          </label>
          <div className={styles.editorWrapper}>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Escriu el contingut de la reunió aquí. Pots utilitzar negretes, cursives i llistes..."
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Signant</h2>

        <div className={styles.field}>
          <label className={styles.label}>
            Nom del signant <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="signerName"
            value={formData.signerName}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ex: Elena Gómez"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Rol del signant <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="signerRole"
            value={formData.signerRole}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ex: Vicepresidenta AMPA"
            required
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.push('/partes')}
          className={styles.cancelButton}
          disabled={loading}
        >
          Cancel·lar
        </button>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Guardant...' : isEdit ? 'Guardar canvis' : 'Crear parte'}
        </button>
      </div>
    </form>
  )
}
