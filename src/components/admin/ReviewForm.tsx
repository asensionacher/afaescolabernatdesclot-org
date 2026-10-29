'use client'

import { useActionState } from 'react'
import type { ActionState } from '@/app/admin/actions/types'
import ActionFeedback from '@/components/admin/ActionFeedback'
import SubmitButton from '@/components/admin/SubmitButton'

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
  const [acceptState, acceptFormAction, accepting] = useActionState<ActionState, FormData>(acceptAction, {
    status: 'idle',
  })
  const [denyState, denyFormAction, denying] = useActionState<ActionState, FormData>(denyAction, {
    status: 'idle',
  })

  return (
    <div className="stack">
      <ActionFeedback state={acceptState} messages={messages} />
      <ActionFeedback state={denyState} messages={messages} />

      <form action={acceptFormAction} className="stack">
        <input type="hidden" name="id" value={submissionId} />
        <div>
          <SubmitButton
            label={`✓ ${labels.accept}`}
            pendingLabel={labels.saving}
            className="btn btnSuccess btnBlock"
            disabled={denying}
          />
        </div>
      </form>

      <form action={denyFormAction} className="stack">
        <input type="hidden" name="id" value={submissionId} />
        <div className="field">
          <label className="label labelRequired" htmlFor="reason">
            {labels.reason}
          </label>
          <textarea
            id="reason"
            name="reason"
            className="textarea"
            required
            placeholder={labels.reason}
            aria-invalid={Boolean(denyState.fieldErrors?.reason)}
            aria-describedby={denyState.fieldErrors?.reason ? 'reason-error' : undefined}
          />
          {denyState.fieldErrors?.reason ? (
            <span id="reason-error" className="errorText">{labels.reasonRequired}</span>
          ) : null}
        </div>
        <div>
          <SubmitButton
            label={`✕ ${labels.deny}`}
            pendingLabel={labels.saving}
            className="btn btnDanger btnBlock"
            disabled={accepting}
          />
        </div>
      </form>
    </div>
  )
}
