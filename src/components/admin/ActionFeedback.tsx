import type { ActionState } from '@/app/admin/actions/types'
import styles from './ActionFeedback.module.css'

export default function ActionFeedback({
  state,
  messages,
}: {
  state: ActionState
  messages: Record<string, string>
}) {
  if (state.status === 'idle' || !state.message) return null

  const isError =
    state.status === 'error' ||
    state.message === 'VALIDATION_ERROR' ||
    state.message.endsWith('Required') ||
    state.message === 'usernameTaken' ||
    state.message === 'slugTaken' ||
    state.message === 'nameTaken' ||
    state.message === 'invalidCurrentPassword' ||
    state.message === 'passwordMismatch'

  const text = messages[state.message] ?? messages.default ?? state.message

  return (
    <div
      className={`alert ${isError ? 'alertError' : 'alertSuccess'} ${styles.feedback}`}
      role={isError ? 'alert' : 'status'}
    >
      {text}
    </div>
  )
}
