'use client'

import { useActionState } from 'react'
import type { ActionState } from '@/app/admin/actions/types'
import ActionFeedback from './ActionFeedback'
import SubmitButton from './SubmitButton'

export interface SchoolYearValues {
  id?: string
  name: string
  startDate: string
  endDate: string
  quotaAmount: number
  isCurrent: boolean
}

export default function SchoolYearForm({
  action,
  year,
  labels,
  messages,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>
  year?: SchoolYearValues
  labels: {
    name: string
    startDate: string
    endDate: string
    quotaAmount: string
    isCurrent: string
    save: string
    saving: string
  }
  messages: Record<string, string>
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { status: 'idle' })

  const fieldError = (key: string): string | undefined => {
    const code = state.fieldErrors?.[key]
    if (!code) return undefined
    return messages[code] ?? code
  }

  return (
    <form action={formAction} className="stack">
      <ActionFeedback state={state} messages={messages} />

      {year?.id ? <input type="hidden" name="id" value={year.id} /> : null}

      <div className="formGrid">
        <div className="field">
          <label className="label labelRequired" htmlFor="name">
            {labels.name}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="input"
            defaultValue={year?.name ?? ''}
            placeholder="2026/2027"
            required
          />
          {fieldError('name') ? <span className="errorText">{fieldError('name')}</span> : null}
        </div>

        <div className="field">
          <label className="label labelRequired" htmlFor="startDate">
            {labels.startDate}
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="input"
            defaultValue={year?.startDate ?? ''}
            required
          />
          {fieldError('startDate') ? (
            <span className="errorText">{fieldError('startDate')}</span>
          ) : null}
        </div>

        <div className="field">
          <label className="label labelRequired" htmlFor="endDate">
            {labels.endDate}
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            className="input"
            defaultValue={year?.endDate ?? ''}
            required
          />
          {fieldError('endDate') ? <span className="errorText">{fieldError('endDate')}</span> : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="quotaAmount">
            {labels.quotaAmount}
          </label>
          <input
            id="quotaAmount"
            name="quotaAmount"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={year ? (year.quotaAmount / 100).toFixed(2) : ''}
          />
        </div>

        <div className="field formGridFull">
          <label className="checkboxRow">
            <input type="checkbox" name="isCurrent" defaultChecked={year?.isCurrent ?? false} />
            <span className="label">{labels.isCurrent}</span>
          </label>
        </div>
      </div>

      <div>
        <SubmitButton label={labels.save} pendingLabel={labels.saving} className="btn btnAccent" />
      </div>
    </form>
  )
}
