export interface ActionState {
  status: 'idle' | 'success' | 'error'
  message?: string
  detail?: string
  fieldErrors?: Record<string, string>
}

export const idleState: ActionState = { status: 'idle' }
