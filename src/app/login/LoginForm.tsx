'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import type { LoginState } from '@/app/actions/auth'
import styles from './LoginForm.module.css'

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn btnBlock" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  )
}

export default function LoginForm({
  action,
  labels,
  next,
}: {
  action: (previous: LoginState, formData: FormData) => Promise<LoginState>
  labels: {
    username: string
    password: string
    submit: string
    loading: string
    invalid: string
    rateLimited: string
    showPassword: string
    hidePassword: string
  }
  next: string
}) {
  const [state, formAction] = useActionState<LoginState, FormData>(action, {})
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={formAction} className={styles.form}>
      {state.error ? (
        <div className="alert alertError" role="alert">
          {state.error === 'rate_limited' ? labels.rateLimited : labels.invalid}
        </div>
      ) : null}

      <div className="field">
        <label className="label" htmlFor="username">
          {labels.username}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          className="input"
          autoComplete="username"
          required
          autoFocus
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="password">
          {labels.password}
        </label>
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          className="input"
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          className="btn btnGhost mt1"
          aria-pressed={showPassword}
          aria-controls="password"
          onClick={() => setShowPassword((current) => !current)}
        >
          {showPassword ? labels.hidePassword : labels.showPassword}
        </button>
      </div>

      {next ? <input type="hidden" name="next" value={next} /> : null}

      <SubmitButton label={labels.submit} pendingLabel={labels.loading} />
    </form>
  )
}
