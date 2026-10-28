'use client'

import { useActionState } from 'react'
import type { ActionState } from '@/app/admin/actions/types'
import ActionFeedback from './ActionFeedback'
import SubmitButton from './SubmitButton'

export interface EmailSettingsValues {
  host: string
  port: number
  user: string
  password: string
  secure: boolean
  fromName: string
  fromEmail: string
}

export default function EmailSettingsForm({
  action,
  testAction,
  values,
  labels,
  messages,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>
  testAction: (previous: ActionState, formData: FormData) => Promise<ActionState>
  values: EmailSettingsValues
  labels: {
    host: string
    port: string
    user: string
    password: string
    secure: string
    fromName: string
    fromEmail: string
    save: string
    saving: string
    test: string
    testTo: string
  }
  messages: Record<string, string>
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { status: 'idle' })
  const [testState, testFormAction] = useActionState<ActionState, FormData>(testAction, { status: 'idle' })

  return (
    <div className="stack">
      <ActionFeedback state={state} messages={messages} />

      <form action={formAction} className="stack">
        <div className="formGrid">
        <div className="field">
          <label className="label" htmlFor="host">
            {labels.host}
          </label>
          <input
            id="host"
            name="host"
            type="text"
            className="input"
            defaultValue={values.host}
            placeholder="smtp.gmail.com"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="port">
            {labels.port}
          </label>
          <input
            id="port"
            name="port"
            type="number"
            className="input"
            defaultValue={values.port}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="user">
            {labels.user}
          </label>
          <input
            id="user"
            name="user"
            type="email"
            className="input"
            defaultValue={values.user}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="smtpPassword">
            {labels.password}
          </label>
          <input
            id="smtpPassword"
            name="password"
            type="password"
            className="input"
            defaultValue=""
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="fromName">
            {labels.fromName}
          </label>
          <input
            id="fromName"
            name="fromName"
            type="text"
            className="input"
            defaultValue={values.fromName}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="fromEmail">
            {labels.fromEmail}
          </label>
          <input
            id="fromEmail"
            name="fromEmail"
            type="email"
            className="input"
            defaultValue={values.fromEmail}
          />
        </div>

        <div className="field formGridFull">
          <label className="checkboxRow">
            <input type="checkbox" name="secure" defaultChecked={values.secure} />
            <span className="label">{labels.secure}</span>
          </label>
        </div>
        </div>

        <div>
          <SubmitButton label={labels.save} pendingLabel={labels.saving} className="btn btnAccent" />
        </div>
      </form>

      <hr className="hr" />

      <form action={testFormAction} className="stack">
        <ActionFeedback state={testState} messages={messages} />
        <div className="field">
          <label className="label" htmlFor="to">
            {labels.testTo}
          </label>
          <input id="to" name="to" type="email" className="input" placeholder="prova@exemple.com" />
        </div>
        <div>
          <SubmitButton label={labels.test} pendingLabel={labels.saving} className="btn btnSecondary" />
        </div>
      </form>
    </div>
  )
}
