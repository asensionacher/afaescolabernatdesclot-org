'use client'

export default function ConfirmButton({
  action,
  id,
  label,
  className = 'btn btnSmall btnGhost',
  message,
  hiddenFields = {},
}: {
  action: (formData: FormData) => void | Promise<void>
  id: string
  label: string
  className?: string
  message: string
  hiddenFields?: Record<string, string>
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  )
}
