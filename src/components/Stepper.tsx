import { roundTo } from '../domain/ratio'

export function Stepper({
  decimals = 1,
  error,
  id,
  label,
  max,
  min = 0,
  onChange,
  step,
  unit,
  value,
}: {
  decimals?: number
  error?: string
  id: string
  label: string
  max: number
  min?: number
  onChange: (value: string) => void
  step: number
  unit?: string
  value: string
}) {
  const bump = (direction: 1 | -1) => {
    const current = Number(value.replace(',', '.'))
    const base = Number.isFinite(current) ? current : min
    const next = Math.min(max, Math.max(min, roundTo(base + direction * step, decimals)))
    onChange(String(next))
  }

  return (
    <div className={`field stepper${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="stepper__row">
        <button aria-label={`Decrease ${label}`} className="stepper__btn" onClick={() => bump(-1)} type="button">
          −
        </button>
        <div className="stepper__input">
          <input
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            enterKeyHint="done"
            id={id}
            inputMode="decimal"
            onChange={(event) => onChange(event.target.value)}
            onFocus={(event) => event.target.select()}
            type="text"
            value={value}
          />
          {unit ? <span className="stepper__unit">{unit}</span> : null}
        </div>
        <button aria-label={`Increase ${label}`} className="stepper__btn" onClick={() => bump(1)} type="button">
          +
        </button>
      </div>
      {error ? (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
