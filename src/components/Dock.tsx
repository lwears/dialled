import type { ReactNode, Ref } from 'react'

export function Dock({
  bottom,
  children,
  label,
  onFocusChange,
  ref,
}: {
  bottom: number | null
  children: ReactNode
  label: string
  onFocusChange: (focused: boolean) => void
  ref: Ref<HTMLElement>
}) {
  return (
    <section
      aria-label={label}
      className={`dock${bottom == null ? '' : ' dock--raised'}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onFocusChange(false)
        }
      }}
      onFocus={() => onFocusChange(true)}
      ref={ref}
      style={bottom == null ? undefined : { bottom }}
    >
      <div className="dock__inner">{children}</div>
    </section>
  )
}
