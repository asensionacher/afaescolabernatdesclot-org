'use client'

import { useEffect, useRef, type RefObject } from 'react'

export function usePreservedForm(): RefObject<HTMLFormElement | null> {
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const form = ref.current
    if (!form) return

    // React resets action forms during commit, when synthetic event handlers are disabled.
    const preventReset = (event: Event): void => event.preventDefault()
    form.addEventListener('reset', preventReset)
    return () => form.removeEventListener('reset', preventReset)
  }, [])

  return ref
}
