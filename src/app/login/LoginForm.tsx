'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction, type LoginState } from '@/app/actions/auth'
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
  labels,
  next,
}: {
  labels: { username: string; password: string; submit: string; loading: string; invalid: string }
  next: string
}) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {})

  return (
    <form action={formAction} className={styles.form}>
      {state.error ? (
        <div className="alert alertError" role="alert">
          {state.error === 'rate_limited' ? labels.invalid : labels.invalid}
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
          type="password"
          className="input"
          autoComplete="current-password"
          required
        />
      </div>

      {next ? <input type="hidden" name="next" value={next} /> : null}

      <SubmitButton label={labels.submit} pendingLabel={labels.loading} />
    </form>
  )
}
