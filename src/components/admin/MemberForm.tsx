'use client'

import { useActionState } from 'react'
import type { ActionState } from '@/app/admin/actions/types'
import ActionFeedback from './ActionFeedback'
import SubmitButton from './SubmitButton'

export interface MemberFormLabels {
  username: string
  password: string
  newPassword: string
  name: string
  email: string
  phone: string
  role: string
  admin: string
  member: string
  active: string
  notes: string
  save: string
  saving: string
  userInfo: string
  personalInfo: string
  resetPasswordHelp: string
}

export default function MemberForm({
  action,
  member,
  labels,
  messages,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>
  member?: {
    id: string
    username: string
    name: string
    email: string
    phone: string | null
    role: string
    active: boolean
    note: string | null
  }
  labels: MemberFormLabels
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

      {member ? <input type="hidden" name="id" value={member.id} /> : null}

      <fieldset className="fieldset">
        <legend className="fieldsetLegend">{labels.userInfo}</legend>

        <div className="formGrid">
          <div className="field">
            <label className="label labelRequired" htmlFor="username">
              {labels.username}
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="input"
              defaultValue={member?.username ?? ''}
              autoComplete="off"
              required
            />
            {fieldError('username') ? (
              <span className="errorText">{fieldError('username')}</span>
            ) : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              {member ? labels.newPassword : labels.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              autoComplete="new-password"
              required={!member}
            />
            {member ? <span className="help">{labels.resetPasswordHelp}</span> : null}
            {fieldError('password') ? (
              <span className="errorText">{fieldError('password')}</span>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldsetLegend">{labels.personalInfo}</legend>

        <div className="formGrid">
          <div className="field formGridFull">
            <label className="label labelRequired" htmlFor="name">
              {labels.name}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              defaultValue={member?.name ?? ''}
              required
            />
            {fieldError('name') ? <span className="errorText">{fieldError('name')}</span> : null}
          </div>

          <div className="field">
            <label className="label labelRequired" htmlFor="email">
              {labels.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              defaultValue={member?.email ?? ''}
              required
            />
            {fieldError('email') ? <span className="errorText">{fieldError('email')}</span> : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="phone">
              {labels.phone}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              defaultValue={member?.phone ?? ''}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="role">
              {labels.role}
            </label>
            <select id="role" name="role" className="select" defaultValue={member?.role ?? 'MEMBER'}>
              <option value="MEMBER">{labels.member}</option>
              <option value="ADMIN">{labels.admin}</option>
            </select>
          </div>

          <div className="field">
            <label className="checkboxRow">
              <input type="checkbox" name="active" defaultChecked={member?.active ?? true} />
              <span className="label">{labels.active}</span>
            </label>
          </div>

          <div className="field formGridFull">
            <label className="label" htmlFor="note">
              {labels.notes}
            </label>
            <textarea
              id="note"
              name="note"
              className="textarea"
              defaultValue={member?.note ?? ''}
            />
          </div>
        </div>
      </fieldset>

      <div>
        <SubmitButton label={labels.save} pendingLabel={labels.saving} className="btn btnAccent" />
      </div>
    </form>
  )
}
