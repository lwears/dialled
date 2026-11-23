import { TASTE_LABELS, TASTE_OTHER, TASTE_SCALE } from '../domain/schemas'
import type { Taste } from '../domain/schemas'

export function TasteGrid({
  error,
  onChange,
  value,
}: {
  error?: string
  onChange: (taste: Taste) => void
  value: Taste | undefined
}) {
  return (
    <fieldset className={`taste-grid${error ? ' taste-grid--error' : ''}`}>
      <legend className="dock__label">
        Taste <span className="taste-grid__hint">· {error ?? 'required'}</span>
      </legend>
      {[TASTE_SCALE, TASTE_OTHER].map((row) => (
        <div className={`taste-grid__row taste-grid__row--${row.length}`} key={row[0]}>
          {row.map((taste: Taste) => (
            <button
              aria-pressed={taste === value}
              className="taste-grid__btn"
              key={taste}
              onClick={() => onChange(taste)}
              type="button"
            >
              {TASTE_LABELS[taste]}
            </button>
          ))}
        </div>
      ))}
    </fieldset>
  )
}
