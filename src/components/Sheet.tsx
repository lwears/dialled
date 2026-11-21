import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export function Sheet({
  children,
  onClose,
  open,
  title,
}: {
  children: ReactNode
  onClose: () => void
  open: boolean
  title: string
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) {
      return
    }
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      aria-labelledby="sheet-title"
      className="sheet"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      onClose={onClose}
      ref={ref}
    >
      {open ? (
        <div className="sheet__body">
          <header className="sheet__header">
            <h2 id="sheet-title">{title}</h2>
            <button aria-label="Close" className="btn btn--ghost sheet__close" onClick={onClose} type="button">
              ✕
            </button>
          </header>
          {children}
        </div>
      ) : null}
    </dialog>
  )
}
