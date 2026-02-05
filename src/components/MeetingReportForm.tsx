'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MeetingReport, Attendee } from '@/lib/sanity'
import styles from './MeetingReportForm.module.css'

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
    location: initialData?.location || '',
    meetingDate: initialData?.meetingDate ? initialData.meetingDate.split('T')[0] : '',
    meetingTime: initialData?.meetingTime || '',
    meetingPlace: initialData?.meetingPlace || '',
    convocationInfo: initialData?.convocationInfo || '',
    welcomeMessage: initialData?.welcomeMessage || '',
    topics: initialData?.topics || [],
    content: initialData?.content || '',
    questions: initialData?.questions || false,
    signerName: initialData?.signerName || '',
    signerRole: initialData?.signerRole || '',
  })

  const [attendees, setAttendees] = useState<Attendee[]>(
    initialData?.attendees || [{ studentName: '', course: '', attendantName: '' }]
  )

  const [topicInput, setTopicInput] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  const addTopic = () => {
    if (topicInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        topics: [...prev.topics, topicInput.trim()],
      }))
      setTopicInput('')
    }
  }

  const removeTopic = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }))
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
        throw new Error(data.error || 'Error al guardar')
      }

      router.push('/partes')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el parte')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Información básica</h2>

        <div className={styles.field}>
          <label className={styles.label}>
            Título de la reunión <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ej: REUNIÓ PROPOSTES I VOTACIÓ DISFRESSA"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Ubicación <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ej: RUA CARNAVAL 2026"
            required
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>
              Fecha <span className={styles.required}>*</span>
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

          <div className={styles.field}>
            <label className={styles.label}>
              Hora <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="meetingTime"
              value={formData.meetingTime}
              onChange={handleChange}
              className={styles.input}
              placeholder="Ej: 16:45"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Lugar de la reunión <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="meetingPlace"
            value={formData.meetingPlace}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ej: biblioteca de l'Escola Bernat Desclot"
            required
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Asistentes</h2>
        
        {attendees.map((attendee, index) => (
          <div key={index} className={styles.attendeeCard}>
            <div className={styles.attendeeHeader}>
              <span className={styles.attendeeNumber}>Asistente {index + 1}</span>
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
                <label className={styles.label}>Nombre del alumno/a</label>
                <input
                  type="text"
                  value={attendee.studentName}
                  onChange={(e) => handleAttendeeChange(index, 'studentName', e.target.value)}
                  className={styles.input}
                  placeholder="Ej: Raul Lucas Asensio"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Curso</label>
                <input
                  type="text"
                  value={attendee.course}
                  onChange={(e) => handleAttendeeChange(index, 'course', e.target.value)}
                  className={styles.input}
                  placeholder="Ej: 1er I i3"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nombre del asistente</label>
              <input
                type="text"
                value={attendee.attendantName}
                onChange={(e) => handleAttendeeChange(index, 'attendantName', e.target.value)}
                className={styles.input}
                placeholder="Ej: Arianna Vila Rosales"
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={addAttendee} className={styles.addButton}>
          + Añadir asistente
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Información de convocatoria</h2>

        <div className={styles.field}>
          <label className={styles.label}>Texto de convocatoria</label>
          <textarea
            name="convocationInfo"
            value={formData.convocationInfo}
            onChange={handleChange}
            className={styles.textarea}
            rows={3}
            placeholder="Información sobre la convocatoria previa"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Mensaje de bienvenida (cursiva)</label>
          <textarea
            name="welcomeMessage"
            value={formData.welcomeMessage}
            onChange={handleChange}
            className={styles.textarea}
            rows={3}
            placeholder="Mensaje inicial que aparecerá en cursiva"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Temas de disfressa</h2>

        <div className={styles.topicInput}>
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
            className={styles.input}
            placeholder="Ej: Fer un grup de comparsa"
          />
          <button type="button" onClick={addTopic} className={styles.addButton}>
            Añadir tema
          </button>
        </div>

        {formData.topics.length > 0 && (
          <ul className={styles.topicsList}>
            {formData.topics.map((topic, index) => (
              <li key={index} className={styles.topicItem}>
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => removeTopic(index)}
                  className={styles.removeButton}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contenido de la reunión</h2>

        <div className={styles.field}>
          <label className={styles.label}>
            Desarrollo de la reunión <span className={styles.required}>*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className={styles.textarea}
            rows={10}
            placeholder="Describe el desarrollo de la reunión..."
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="questions"
              checked={formData.questions}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span>¿Hubo preguntas por parte de los asistentes?</span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Firmante</h2>

        <div className={styles.field}>
          <label className={styles.label}>
            Nombre del firmante <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="signerName"
            value={formData.signerName}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ej: Elena Gómez"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Rol del firmante <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="signerRole"
            value={formData.signerRole}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ej: Vicepresidenta AMPA"
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
          Cancelar
        </button>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear parte'}
        </button>
      </div>
    </form>
  )
}
