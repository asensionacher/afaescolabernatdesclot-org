'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import type { SubmitState } from '@/app/actions/submissions'
import type { FormFieldType } from '@/lib/forms'
import { usePreservedForm } from '@/lib/use-preserved-form'
import styles from './FormFiller.module.css'

export interface FillerField {
  id: string
  label: string
  type: FormFieldType
  required: boolean
  help?: string
  placeholder?: string
  options?: string[]
}

export interface FillerLabels {
  contactName: string
  email: string
  phone: string
  contactHelp: string
  fieldsLegend: string
  successTitle: string
  backToForms: string
  checkTitle: string
  checkHelp: string
  totalLabel: string
  totalPrice: string
  fileHint: string
  contactLegend: string
  submit: string
  submitting: string
  requiredHint: string
  success: string
  errorGeneric: string
  uploadFile: string
  selectOption: string
  yesNo: string
  errors: {
    required: string
    email: string
    number: string
    fileTooBig: string
  }
}

function SubmitButton({
  label,
  pendingLabel,
  disabled,
}: {
  label: string
  pendingLabel: string
  disabled: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn btnAccent btnBlock" disabled={pending || disabled}>
      {pending ? pendingLabel : label}
    </button>
  )
}

export default function FormFiller({
  action,
  fields,
  locked,
  defaultName,
  defaultEmail,
  defaultPhone,
  labels,
}: {
  action: (previous: SubmitState, formData: FormData) => Promise<SubmitState>
  fields: FillerField[]
  locked: boolean
  defaultName: string
  defaultEmail: string
  defaultPhone: string
  labels: FillerLabels
}) {
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(action, { status: 'idle' })
  const feedbackRef = useRef<HTMLDivElement>(null)
  const formRef = usePreservedForm()

  useEffect(() => {
    if (state.status !== 'idle') feedbackRef.current?.focus()
  }, [state])

  if (state.status === 'success') {
    return (
      <div className={styles.success} role="status" tabIndex={-1} ref={feedbackRef}>
        <h2>{labels.successTitle}</h2>
        <p>{labels.success}</p>
        <Link href="/#formularis" className="btn btnSecondary mt2">{labels.backToForms}</Link>
      </div>
    )
  }

  const errorFor = (key: string): string | undefined => {
    const code = state.fieldErrors?.[key]
    if (!code) return undefined
    if (code === 'email') return labels.errors.email
    if (code === 'number') return labels.errors.number
    if (code === 'fileTooBig') return labels.errors.fileTooBig
    return labels.errors.required
  }

  return (
    <form
      action={formAction}
      className={styles.form}
      aria-busy={pending}
      ref={formRef}
    >
      {state.status === 'error' ? (
        <div className="alert alertError" role="alert" tabIndex={-1} ref={feedbackRef}>
          <p>{labels.errorGeneric}</p>
          {state.fieldErrors ? (
            <ul className={styles.errorList}>
              {Object.keys(state.fieldErrors).map((key) => (
                <li key={key}>
                  <a href={`#${['contactName', 'contactEmail', 'contactPhone'].includes(key) ? key : `field_${key}`}`}>
                    {key === 'contactName' ? labels.contactName : key === 'contactEmail'
                      ? labels.email : fields.find((field) => field.id === key)?.label}: {errorFor(key)}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <fieldset className={styles.section} disabled={locked || pending}>
        <legend className="fieldsetLegend"><span className="stepNumber">1</span>{labels.contactLegend}</legend>
        <p className="help mb1">{labels.requiredHint}</p>

        <div className="field">
          <label className="label labelRequired" htmlFor="contactName">
            {labels.contactName}
          </label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            className="input"
            defaultValue={defaultName}
            autoComplete="name"
            aria-invalid={Boolean(errorFor('contactName'))}
            aria-describedby={errorFor('contactName') ? 'contactName-error' : undefined}
            required
          />
          {errorFor('contactName') ? <span id="contactName-error" className="errorText">{errorFor('contactName')}</span> : null}
        </div>

        <div className="formGrid">
          <div className="field">
            <label className="label labelRequired" htmlFor="contactEmail">
              {labels.email}
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              className="input"
              defaultValue={defaultEmail}
              autoComplete="email"
              aria-invalid={Boolean(errorFor('contactEmail'))}
              aria-describedby={`contactEmail-help${errorFor('contactEmail') ? ' contactEmail-error' : ''}`}
              required
            />
            {errorFor('contactEmail') ? (
              <span id="contactEmail-error" className="errorText">{errorFor('contactEmail')}</span>
            ) : null}
            <span id="contactEmail-help" className="help">{labels.contactHelp}</span>
          </div>

          <div className="field">
            <label className="label" htmlFor="contactPhone">
              {labels.phone}
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              className="input"
              defaultValue={defaultPhone}
              autoComplete="tel"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.section} disabled={locked || pending}>
        <legend className="fieldsetLegend"><span className="stepNumber">2</span>{labels.fieldsLegend}</legend>

        {fields.map((field) => {
          const inputName = `field_${field.id}`
          const error = errorFor(field.id)
          const accessibility = {
            'aria-invalid': Boolean(error),
            'aria-describedby': [
              field.help || field.type === 'FILE' ? `${inputName}-help` : '',
              error ? `${inputName}-error` : '',
            ].filter(Boolean).join(' ') || undefined,
          }

          return (
            <div className="field" key={field.id}>
              {field.type === 'CHECKBOX' ? (
                <label className="checkboxRow">
                  <input
                    {...accessibility}
                    id={inputName}
                    type="checkbox"
                    name={inputName}
                    value="Sí"
                    required={field.required}
                  />
                  <span className={field.required ? 'label labelRequired' : 'label'}>
                    {field.label}
                  </span>
                </label>
              ) : field.type === 'RADIO' ? (
                <fieldset
                  id={inputName}
                  aria-invalid={accessibility['aria-invalid']}
                  aria-describedby={accessibility['aria-describedby']}
                  className="fieldset"
                  key={field.id}
                >
                  <legend className={field.required ? 'label labelRequired' : 'label'}>
                    {field.label}
                  </legend>
                  {(field.options ?? []).map((option) => (
                    <label className="radioRow" key={option}>
                      <input
                        type="radio"
                        name={inputName}
                        value={option}
                        required={field.required}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
              ) : field.type === 'TEXTAREA' ? (
                <>
                  <label className={field.required ? 'label labelRequired' : 'label'} htmlFor={inputName}>
                    {field.label}
                  </label>
                  <textarea
                    {...accessibility}
                    id={inputName}
                    name={inputName}
                    className="textarea"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </>
              ) : field.type === 'SELECT' ? (
                <>
                  <label className={field.required ? 'label labelRequired' : 'label'} htmlFor={inputName}>
                    {field.label}
                  </label>
                  <select
                    {...accessibility}
                    id={inputName}
                    name={inputName}
                    className="select"
                    required={field.required}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {labels.selectOption}
                    </option>
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </>
              ) : field.type === 'FILE' ? (
                <>
                  <label className={field.required ? 'label labelRequired' : 'label'} htmlFor={inputName}>
                    {field.label}
                  </label>
                  <input
                    {...accessibility}
                    id={inputName}
                    name={inputName}
                    type="file"
                    className="input"
                    required={field.required}
                  />
                </>
              ) : (
                <>
                  <label className={field.required ? 'label labelRequired' : 'label'} htmlFor={inputName}>
                    {field.label}
                  </label>
                  <input
                    {...accessibility}
                    id={inputName}
                    name={inputName}
                    type={inputTypeFor(field.type)}
                    className="input"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </>
              )}

              {field.help || field.type === 'FILE' ? (
                <span id={`${inputName}-help`} className="help">
                  {field.help} {field.type === 'FILE' ? labels.fileHint : ''}
                </span>
              ) : null}
              {error ? <span id={`${inputName}-error`} className="errorText">{error}</span> : null}
            </div>
          )
        })}
      </fieldset>

      <section className={styles.review}>
        <h2 className="fieldsetLegend"><span className="stepNumber">3</span>{labels.checkTitle}</h2>
        <p className="muted mb1">{labels.checkHelp}</p>
        <p className={styles.total}>{labels.totalLabel} <strong>{labels.totalPrice}</strong></p>
        <SubmitButton
        label={labels.submit}
        pendingLabel={labels.submitting}
        disabled={locked}
        />
      </section>
    </form>
  )
}

function inputTypeFor(type: FormFieldType): string {
  switch (type) {
    case 'EMAIL':
      return 'email'
    case 'PHONE':
      return 'tel'
    case 'NUMBER':
      return 'number'
    case 'DATE':
      return 'date'
    default:
      return 'text'
  }
}
