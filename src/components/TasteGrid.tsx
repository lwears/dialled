import { TASTE_LABELS, TASTES } from '../domain/schemas'
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
      <div className="taste-grid__row">
        {TASTES.map((taste) => (
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
    </fieldset>
  )
}
