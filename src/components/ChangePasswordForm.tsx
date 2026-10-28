'use client'

import { useActionState } from 'react'
import type { ActionState } from '@/app/admin/actions/types'
import ActionFeedback from './admin/ActionFeedback'
import SubmitButton from './admin/SubmitButton'

export default function ChangePasswordForm({
  action,
  labels,
  messages,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>
  labels: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
    save: string
    saving: string
  }
  messages: Record<string, string>
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { status: 'idle' })

  return (
    <form action={formAction} className="stack">
      <ActionFeedback state={state} messages={messages} />

      <div className="field">
        <label className="label labelRequired" htmlFor="currentPassword">
          {labels.currentPassword}
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          className="input"
          autoComplete="current-password"
          required
        />
      </div>

      <div className="formGrid">
        <div className="field">
          <label className="label labelRequired" htmlFor="newPassword">
            {labels.newPassword}
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            className="input"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="field">
          <label className="label labelRequired" htmlFor="confirmPassword">
            {labels.confirmPassword}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="input"
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <div>
        <SubmitButton label={labels.save} pendingLabel={labels.saving} className="btn btnAccent" />
      </div>
    </form>
  )
}
