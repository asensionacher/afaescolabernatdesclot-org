'use client'

import { useActionState } from 'react'
import type { ActionState } from '@/app/admin/actions/types'
import { usePreservedForm } from '@/lib/use-preserved-form'
import SubmitButton from './SubmitButton'

export interface QuotaYear {
  id: string
  name: string
}

export interface QuotaValues {
  status: string
  amount: number
  method: string | null
  note: string | null
}

export default function QuotaForm({
  action,
  userId,
  years,
  currentYearId,
  values,
  labels,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>
  userId: string
  years: QuotaYear[]
  currentYearId: string | null
  values: QuotaValues
  labels: {
    year: string
    status: string
    amount: string
    method: string
    note: string
    save: string
    saving: string
    saved: string
    error: string
    pending: string
    paid: string
    exempt: string
  }
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { status: 'idle' })
  const formRef = usePreservedForm()

  return (
    <form ref={formRef} action={formAction} className="stack">
      <input type="hidden" name="userId" value={userId} />

      {state.status === 'success' ? (
        <div className="alert alertSuccess" role="status">
          {labels.saved}
        </div>
      ) : null}
      {state.status === 'error' ? (
        <div className="alert alertError" role="alert">{labels.error}</div>
      ) : null}

      <div className="formGrid">
        <div className="field">
          <label className="label" htmlFor="quota-schoolYearId">
            {labels.year}
          </label>
          <select
            id="quota-schoolYearId"
            name="schoolYearId"
            className="select"
            defaultValue={currentYearId ?? years[0]?.id ?? ''}
          >
            {years.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="quota-status">
            {labels.status}
          </label>
          <select id="quota-status" name="status" className="select" defaultValue={values.status}>
            <option value="PENDING">{labels.pending}</option>
            <option value="PAID">{labels.paid}</option>
            <option value="EXEMPT">{labels.exempt}</option>
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="quota-amount">
            {labels.amount}
          </label>
          <input
            id="quota-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={(values.amount / 100).toFixed(2)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="quota-method">
            {labels.method}
          </label>
          <input
            id="quota-method"
            name="method"
            type="text"
            className="input"
            defaultValue={values.method ?? ''}
          />
        </div>

        <div className="field formGridFull">
          <label className="label" htmlFor="quota-note">
            {labels.note}
          </label>
          <input
            id="quota-note"
            name="note"
            type="text"
            className="input"
            defaultValue={values.note ?? ''}
          />
        </div>
      </div>

      <div>
        <SubmitButton label={labels.save} pendingLabel={labels.saving} className="btn btnSmall" />
      </div>
    </form>
  )
}
