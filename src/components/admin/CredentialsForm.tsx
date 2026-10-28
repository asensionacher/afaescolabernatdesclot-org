'use client'

import { useActionState } from 'react'
import type { ActionState } from '@/app/admin/actions/types'
import ActionFeedback from './ActionFeedback'
import SubmitButton from './SubmitButton'

export default function CredentialsForm({
  action,
  labels,
  messages,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>
  labels: {
    currentPassword: string
    username: string
    password: string
    confirmPassword: string
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

      <div className="formGrid">
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
          {fieldError('currentPassword') ? (
            <span className="errorText">{fieldError('currentPassword')}</span>
          ) : null}
        </div>

        <div className="field">
          <label className="label labelRequired" htmlFor="username">
            {labels.username}
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className="input"
            autoComplete="username"
            required
          />
          {fieldError('username') ? <span className="errorText">{fieldError('username')}</span> : null}
        </div>

        <div className="field">
          <label className="label labelRequired" htmlFor="password">
            {labels.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="new-password"
            required
          />
          {fieldError('password') ? (
            <span className="errorText">{fieldError('password')}</span>
          ) : null}
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
