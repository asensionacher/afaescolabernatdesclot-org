'use client'

import { useActionState } from 'react'
import type { ActionState } from '@/app/admin/actions/types'
import ActionFeedback from './ActionFeedback'

export default function ReviewForm({
  acceptAction,
  denyAction,
  submissionId,
  labels,
  messages,
}: {
  acceptAction: (previous: ActionState, formData: FormData) => Promise<ActionState>
  denyAction: (previous: ActionState, formData: FormData) => Promise<ActionState>
  submissionId: string
  labels: {
    reason: string
    accept: string
    deny: string
    saving: string
    reasonRequired: string
  }
  messages: Record<string, string>
}) {
  const [acceptState, acceptFormAction] = useActionState<ActionState, FormData>(acceptAction, {
    status: 'idle',
  })
  const [denyState, denyFormAction] = useActionState<ActionState, FormData>(denyAction, {
    status: 'idle',
  })

  return (
    <div className="stack">
      <ActionFeedback state={acceptState} messages={messages} />
      <ActionFeedback state={denyState} messages={messages} />

      <form action={acceptFormAction} className="stack">
        <input type="hidden" name="id" value={submissionId} />
        <div>
          <button type="submit" className="btn btnSuccess">
            ✓ {labels.accept}
          </button>
        </div>
      </form>

      <form action={denyFormAction} className="stack">
        <input type="hidden" name="id" value={submissionId} />
        <div className="field">
          <label className="label" htmlFor="reason">
            {labels.reason}
          </label>
          <textarea
            id="reason"
            name="reason"
            className="textarea"
            required
            placeholder={labels.reason}
          />
          {denyState.fieldErrors?.reason ? (
            <span className="errorText">{labels.reasonRequired}</span>
          ) : null}
        </div>
        <div>
          <button type="submit" className="btn btnDanger">
            ✕ {labels.deny}
          </button>
        </div>
      </form>
    </div>
  )
}
