'use client'

import { useActionState, useState } from 'react'
import type { ActionState } from '@/app/admin/actions/types'
import type { FormField, FormFieldType } from '@/lib/forms'
import { usePreservedForm } from '@/lib/use-preserved-form'
import ActionFeedback from '@/components/admin/ActionFeedback'
import SubmitButton from '@/components/admin/SubmitButton'
import styles from './FormEditor.module.css'

export interface FormEditorLabels {
  editorHelp: string
  contentHelp: string
  fieldsHelp: string
  publishingHelp: string
  untitledField: string
  slugHelp: string
  fieldTypes: Record<FormFieldType, string>
  archived: string
  general: string
  content: string
  fields: string
  pricing: string
  visibility: string
  publishing: string
  formTitle: string
  titleCa: string
  titleEs: string
  descriptionCa: string
  descriptionEs: string
  noticeCa: string
  noticeEs: string
  slug: string
  schoolYear: string
  visibilityPublic: string
  visibilityMembers: string
  memberPrice: string
  memberPriceHint: string
  nonMemberPrice: string
  nonMemberPriceHint: string
  publishedAt: string
  closesAt: string
  pinned: string
  status: string
  fieldLabel: string
  fieldLabelEs: string
  fieldType: string
  fieldHelp: string
  fieldRequired: string
  fieldOptions: string
  fieldPlaceholder: string
  addField: string
  noFields: string
  moveUp: string
  moveDown: string
  remove: string
  save: string
  saving: string
  draft: string
  published: string
  languageNote: string
}

export interface FormEditorValues {
  id: string
  slug: string
  titleCa: string
  titleEs: string
  descriptionCa: string
  descriptionEs: string
  noticeCa: string
  noticeEs: string
  schoolYearId: string
  visibility: string
  status: string
  memberPrice: number
  nonMemberPrice: number
  publishedAt: string
  closesAt: string
  pinned: boolean
  fields: FormField[]
}

const FIELD_TYPES: FormFieldType[] = [
  'TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'NUMBER',
  'DATE', 'SELECT', 'RADIO', 'CHECKBOX', 'FILE',
]

function newField(index: number): FormField {
  return {
    id: `field_${Date.now().toString(36)}_${index}`,
    label: '',
    type: 'TEXT',
    required: false,
    options: [],
  }
}

function toDateInput(value: Date | null): string {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default function FormEditor({
  action,
  form,
  years,
  currentYearId,
  labels,
  messages,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>
  form?: FormEditorValues
  years: { id: string; name: string }[]
  currentYearId: string | null
  labels: FormEditorLabels
  messages: Record<string, string>
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { status: 'idle' })
  const [fields, setFields] = useState<FormField[]>(form?.fields ?? [])
  const [status, setStatus] = useState(form?.status ?? 'DRAFT')
  const formRef = usePreservedForm()

  const fieldError = (key: string): string | undefined => {
    const code = state.fieldErrors?.[key]
    if (!code) return undefined
    return messages[code] ?? code
  }

  function updateField(index: number, patch: Partial<FormField>) {
    setFields((current) =>
      current.map((field, position) => (position === index ? { ...field, ...patch } : field)),
    )
  }

  function moveField(index: number, direction: -1 | 1) {
    setFields((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(target, 0, item)
      return copy
    })
  }

  return (
    <form ref={formRef} action={formAction} className="stack">
      <ActionFeedback state={state} messages={messages} />
      <p className="muted">{labels.editorHelp}</p>
      <nav className={styles.steps} aria-label={labels.formTitle}>
        {[labels.content, labels.fields, labels.pricing, labels.general, labels.publishing].map((label, index) => (
          <a href={`#editor-step-${index + 1}`} key={label}>
            <span className="stepNumber">{index + 1}</span>{label}
          </a>
        ))}
      </nav>

      {form?.id ? <input type="hidden" name="id" value={form.id} /> : null}
      <input type="hidden" name="fields" value={JSON.stringify(fields.map((field) => ({
        ...field,
        options: field.options?.map((option) => option.trim()).filter(Boolean),
      })))} />

      <section id="editor-step-1" className="card">
        <h3 className="cardTitle"><span className="stepNumber">1</span>{labels.content}</h3>
        <p className="muted mb1">{labels.contentHelp}</p>
        <p className="small muted mb2">{labels.languageNote}</p>

        <div className="formGrid">
          <div className="field">
            <label className="label labelRequired" htmlFor="titleCa">
              {labels.titleCa}
            </label>
            <input
              id="titleCa"
              name="titleCa"
              type="text"
              className="input"
              defaultValue={form?.titleCa ?? ''}
              required
            />
            {fieldError('titleCa') ? <span className="errorText">{fieldError('titleCa')}</span> : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="titleEs">
              {labels.titleEs}
            </label>
            <input
              id="titleEs"
              name="titleEs"
              type="text"
              className="input"
              defaultValue={form?.titleEs ?? ''}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="descriptionCa">
              {labels.descriptionCa}
            </label>
            <textarea
              id="descriptionCa"
              name="descriptionCa"
              className="textarea"
              defaultValue={form?.descriptionCa ?? ''}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="descriptionEs">
              {labels.descriptionEs}
            </label>
            <textarea
              id="descriptionEs"
              name="descriptionEs"
              className="textarea"
              defaultValue={form?.descriptionEs ?? ''}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="noticeCa">
              {labels.noticeCa}
            </label>
            <textarea
              id="noticeCa"
              name="noticeCa"
              className="textarea"
              defaultValue={form?.noticeCa ?? ''}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="noticeEs">
              {labels.noticeEs}
            </label>
            <textarea
              id="noticeEs"
              name="noticeEs"
              className="textarea"
              defaultValue={form?.noticeEs ?? ''}
            />
          </div>
        </div>
      </section>

      <section id="editor-step-2" className="card">
        <h3 className="cardTitle"><span className="stepNumber">2</span>{labels.fields}</h3>
        <p className="muted mb2">{labels.fieldsHelp}</p>

        {fields.length === 0 ? <p className="muted mb1">{labels.noFields}</p> : null}

        {fields.map((field, index) => (
          <fieldset className={styles.question} key={field.id}>
            <legend className="fieldsetLegend">
              {index + 1}. {field.label || labels.untitledField}
            </legend>

            <div className="formGrid">
              <div className="field">
                <label className="label labelRequired" htmlFor={`label-${field.id}`}>
                  {labels.fieldLabel}
                </label>
                <input
                  id={`label-${field.id}`}
                  type="text"
                  className="input"
                  value={field.label}
                  required
                  onChange={(event) => updateField(index, { label: event.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor={`labelEs-${field.id}`}>
                  {labels.fieldLabelEs}
                </label>
                <input
                  id={`labelEs-${field.id}`}
                  type="text"
                  className="input"
                  value={field.labelEs ?? ''}
                  onChange={(event) => updateField(index, { labelEs: event.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor={`type-${field.id}`}>
                  {labels.fieldType}
                </label>
                <select
                  id={`type-${field.id}`}
                  className="select"
                  value={field.type}
                  onChange={(event) =>
                    updateField(index, { type: event.target.value as FormFieldType })
                  }
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {labels.fieldTypes[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor={`help-${field.id}`}>
                  {labels.fieldHelp}
                </label>
                <input
                  id={`help-${field.id}`}
                  type="text"
                  className="input"
                  value={field.help ?? ''}
                  onChange={(event) => updateField(index, { help: event.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor={`placeholder-${field.id}`}>
                  {labels.fieldPlaceholder}
                </label>
                <input
                  id={`placeholder-${field.id}`}
                  type="text"
                  className="input"
                  value={field.placeholder ?? ''}
                  onChange={(event) => updateField(index, { placeholder: event.target.value })}
                />
              </div>

              {field.type === 'SELECT' || field.type === 'RADIO' ? (
                <div className="field">
                  <label className="label" htmlFor={`options-${field.id}`}>
                    {labels.fieldOptions}
                  </label>
                  <textarea
                    id={`options-${field.id}`}
                    className="textarea"
                    value={(field.options ?? []).join('\n')}
                    onChange={(event) =>
                      updateField(index, {
                        options: event.target.value.split('\n'),
                      })
                    }
                  />
                </div>
              ) : null}

              <div className="field formGridFull">
                <label className="checkboxRow">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(event) => updateField(index, { required: event.target.checked })}
                  />
                  <span className="label">{labels.fieldRequired}</span>
                </label>

                <div className="row">
                  <button
                    type="button"
                    className="btn btnSmall btnGhost"
                    onClick={() => moveField(index, -1)}
                    disabled={index === 0}
                    aria-label={`${labels.moveUp}: ${field.label || labels.untitledField}`}
                  >
                    ↑ {labels.moveUp}
                  </button>
                  <button
                    type="button"
                    className="btn btnSmall btnGhost"
                    onClick={() => moveField(index, 1)}
                    disabled={index === fields.length - 1}
                    aria-label={`${labels.moveDown}: ${field.label || labels.untitledField}`}
                  >
                    ↓ {labels.moveDown}
                  </button>
                  <button
                    type="button"
                    className="btn btnSmall btnGhost"
                    onClick={() =>
                      setFields((current) => current.filter((_, position) => position !== index))
                    }
                    aria-label={`${labels.remove}: ${field.label || labels.untitledField}`}
                  >
                    {labels.remove}
                  </button>
                </div>
              </div>
            </div>
          </fieldset>
        ))}

        {fieldError('fields') ? <span className="errorText">{fieldError('fields')}</span> : null}

        <button
          type="button"
          className="btn btnSecondary"
          onClick={() => setFields((current) => [...current, newField(current.length)])}
        >
          + {labels.addField}
        </button>
      </section>

      <section id="editor-step-3" className="card">
        <h3 className="cardTitle"><span className="stepNumber">3</span>{labels.pricing}</h3>
        <div className="formGrid">
          <div className="field">
            <label className="label" htmlFor="memberPrice">
              {labels.memberPrice}
            </label>
            <input
              id="memberPrice"
              name="memberPrice"
              type="number"
              step="0.01"
              min="0"
              className="input"
              defaultValue={form ? (form.memberPrice / 100).toFixed(2) : '0'}
            />
            <span className="help">{labels.memberPriceHint}</span>
          </div>

          <div className="field">
            <label className="label" htmlFor="nonMemberPrice">
              {labels.nonMemberPrice}
            </label>
            <input
              id="nonMemberPrice"
              name="nonMemberPrice"
              type="number"
              step="0.01"
              min="0"
              className="input"
              defaultValue={form ? (form.nonMemberPrice / 100).toFixed(2) : '0'}
            />
            <span className="help">{labels.nonMemberPriceHint}</span>
          </div>
        </div>
      </section>

      <section id="editor-step-4" className="card">
        <h3 className="cardTitle"><span className="stepNumber">4</span>{labels.general}</h3>
        <div className="formGrid">
          <div className="field">
            <label className="label" htmlFor="schoolYearId">
              {labels.schoolYear}
            </label>
            <select
              id="schoolYearId"
              name="schoolYearId"
              className="select"
              defaultValue={form?.schoolYearId ?? currentYearId ?? ''}
            >
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
            {fieldError('schoolYearId') ? (
              <span className="errorText">{fieldError('schoolYearId')}</span>
            ) : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="slug">
              {labels.slug}
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              className="input"
              defaultValue={form?.slug ?? ''}
              placeholder="sortida-nadal-2026"
              aria-describedby="slug-help"
            />
            <span id="slug-help" className="help">{labels.slugHelp}</span>
            {fieldError('slug') ? <span className="errorText">{fieldError('slug')}</span> : null}
          </div>

          <div className="field formGridFull">
            <label className="label" htmlFor="visibility">
              {labels.visibility}
            </label>
            <select
              id="visibility"
              name="visibility"
              className="select"
              defaultValue={form?.visibility ?? 'PUBLIC'}
            >
              <option value="PUBLIC">{labels.visibilityPublic}</option>
              <option value="MEMBERS_ONLY">{labels.visibilityMembers}</option>
            </select>
          </div>
        </div>
      </section>

      <section id="editor-step-5" className="card">
        <h3 className="cardTitle"><span className="stepNumber">5</span>{labels.publishing}</h3>
        <p className="muted mb2">{labels.publishingHelp}</p>
        <div className="formGrid">
          <div className="field">
            <label className="label" htmlFor="publishedAt">
              {labels.publishedAt}
            </label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="date"
              className="input"
              defaultValue={toDateInput(form?.publishedAt ? new Date(form.publishedAt) : null)}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="closesAt">
              {labels.closesAt}
            </label>
            <input
              id="closesAt"
              name="closesAt"
              type="date"
              className="input"
              defaultValue={toDateInput(form?.closesAt ? new Date(form.closesAt) : null)}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="status">
              {labels.status}
            </label>
            <select
              id="status"
              name="status"
              className="select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="DRAFT">{labels.draft}</option>
              <option value="PUBLISHED">{labels.published}</option>
              {form?.status === 'ARCHIVED' ? <option value="ARCHIVED">{labels.archived}</option> : null}
            </select>
          </div>

          <div className="field">
            <label className="checkboxRow">
              <input type="checkbox" name="pinned" defaultChecked={form?.pinned ?? false} />
              <span className="label">{labels.pinned}</span>
            </label>
          </div>
        </div>
      </section>

      <div className={styles.save}>
        <span className={`badge ${status === 'PUBLISHED' ? 'badgeSuccess' : 'badgeWarning'}`}>
          {status === 'PUBLISHED' ? labels.published : status === 'ARCHIVED' ? labels.archived : labels.draft}
        </span>
        <SubmitButton label={labels.save} pendingLabel={labels.saving} className="btn btnAccent" />
      </div>
    </form>
  )
}
