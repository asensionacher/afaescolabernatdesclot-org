'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitFormAction, type SubmitState } from '@/app/actions/submissions'
import type { FormFieldType } from '@/lib/forms'
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
  formId,
  fields,
  locked,
  defaultName,
  defaultEmail,
  defaultPhone,
  labels,
}: {
  formId: string
  fields: FillerField[]
  locked: boolean
  defaultName: string
  defaultEmail: string
  defaultPhone: string
  labels: FillerLabels
}) {
  const action = submitFormAction.bind(null, formId)
  const [state, formAction] = useActionState<SubmitState, FormData>(action, { status: 'idle' })

  if (state.status === 'success') {
    return (
      <div className={styles.success}>
        <h3>{labels.success}</h3>
        <p>{labels.success}</p>
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
    <form action={formAction} className={styles.form}>
      {state.status === 'error' && state.message !== 'VALIDATION_ERROR' ? (
        <div className="alert alertError" role="alert">
          {labels.errorGeneric}
        </div>
      ) : null}

      <fieldset className="fieldset">
        <legend className="fieldsetLegend">{labels.contactLegend}</legend>
        <p className="help mb1">{labels.requiredHint}</p>

        <div className="field">
          <label className="label labelRequired" htmlFor="contactName">
            Nom i cognoms
          </label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            className="input"
            defaultValue={defaultName}
            required
          />
          {errorFor('contactName') ? <span className="errorText">{errorFor('contactName')}</span> : null}
        </div>

        <div className="formGrid">
          <div className="field">
            <label className="label labelRequired" htmlFor="contactEmail">
              Correu electrònic
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              className="input"
              defaultValue={defaultEmail}
              required
            />
            {errorFor('contactEmail') ? (
              <span className="errorText">{errorFor('contactEmail')}</span>
            ) : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="contactPhone">
              Telèfon
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              className="input"
              defaultValue={defaultPhone}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldsetLegend">Dades del formulari</legend>

        {fields.map((field) => {
          const inputName = `field_${field.id}`
          const error = errorFor(field.id)

          return (
            <div className="field" key={field.id}>
              {field.type === 'CHECKBOX' ? (
                <label className="checkboxRow">
                  <input type="checkbox" name={inputName} value="Sí" />
                  <span className={field.required ? 'label labelRequired' : 'label'}>
                    {field.label}
                  </span>
                </label>
              ) : field.type === 'RADIO' ? (
                <fieldset className="fieldset" key={field.id}>
                  <legend className={field.required ? 'label labelRequired' : 'label'}>
                    {field.label}
                  </legend>
                  {(field.options ?? []).map((option) => (
                    <label className="radioRow" key={option}>
                      <input type="radio" name={inputName} value={option} />
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
                    id={inputName}
                    name={inputName}
                    type={inputTypeFor(field.type)}
                    className="input"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </>
              )}

              {field.help ? <span className="help">{field.help}</span> : null}
              {error ? <span className="errorText">{error}</span> : null}
            </div>
          )
        })}
      </fieldset>

      <SubmitButton
        label={labels.submit}
        pendingLabel={labels.submitting}
        disabled={locked}
      />
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
