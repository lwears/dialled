import { roundTo } from '../domain/ratio'

export function StepperRow({
  decimals,
  error,
  hint,
  id,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  decimals: number
  error?: string
  hint: string
  id: string
  label: string
  max: number
  min: number
  onChange: (value: string) => void
  step: number
  value: string
}) {
  const bump = (direction: 1 | -1) => {
    const current = Number(value.replace(',', '.'))
    const base = Number.isFinite(current) ? current : min
    onChange(String(Math.min(max, Math.max(min, roundTo(base + direction * step, decimals)))))
  }

  return (
    <div className={`stepper-row${error ? ' stepper-row--error' : ''}`}>
      <label className="stepper-row__label" htmlFor={id}>
        {label}
        <span className="stepper-row__hint" id={`${id}-hint`}>
          {error ?? hint}
        </span>
      </label>
      <button aria-label={`Decrease ${label.toLowerCase()}`} className="stepper-row__btn" onClick={() => bump(-1)} type="button">
        −
      </button>
      <input
        aria-describedby={`${id}-hint`}
        aria-invalid={error ? true : undefined}
        autoComplete="off"
        className="stepper-row__value"
        enterKeyHint="done"
        id={id}
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value)}
        onFocus={(event) => event.target.select()}
        type="text"
        value={value}
      />
      <button aria-label={`Increase ${label.toLowerCase()}`} className="stepper-row__btn" onClick={() => bump(1)} type="button">
        +
      </button>
    </div>
  )
}
