'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({
  label,
  pendingLabel,
  className = 'btn',
  disabled = false,
}: {
  label: string
  pendingLabel: string
  className?: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={className} disabled={pending || disabled}>
      {pending ? pendingLabel : label}
    </button>
  )
}
