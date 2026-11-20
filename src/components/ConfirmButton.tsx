import { useState } from 'react'

export function ConfirmButton({
  confirmLabel,
  label,
  onConfirm,
}: {
  confirmLabel: string
  label: string
  onConfirm: () => void
}) {
  const [armed, setArmed] = useState(false)
  return (
    <button
      className={`btn ${armed ? 'btn--danger' : 'btn--ghost'}`}
      onBlur={() => setArmed(false)}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      type="button"
    >
      {armed ? confirmLabel : label}
    </button>
  )
}
