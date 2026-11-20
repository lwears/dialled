import { ROAST_LABELS, ROAST_LEVELS } from '../domain/schemas'
import type { RoastLevel } from '../domain/schemas'
import { ChoiceChips } from './ChoiceChips'

export interface BeanDraft {
  name: string
  roaster: string
  roastLevel: RoastLevel
  roastDate: string
  notes: string
}

export type BeanErrors = Partial<Record<'name' | 'roastDate', string>>

const ROAST_OPTIONS = ROAST_LEVELS.map((level) => ({ label: ROAST_LABELS[level], value: level }))

export function BeanFields({
  draft,
  errors,
  onChange,
}: {
  draft: BeanDraft
  errors: BeanErrors
  onChange: (patch: Partial<BeanDraft>) => void
}) {
  return (
    <div className="bean-fields">
      <div className={`field${errors.name ? ' field--error' : ''}`}>
        <label className="field__label" htmlFor="bean-name">
          Name
        </label>
        <input
          autoComplete="off"
          className="input"
          id="bean-name"
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="e.g. Ethiopia Guji"
          value={draft.name}
        />
        {errors.name ? <p className="field__error">{errors.name}</p> : null}
      </div>
      <div className="field">
        <label className="field__label" htmlFor="bean-roaster">
          Roaster
        </label>
        <input
          autoComplete="off"
          className="input"
          id="bean-roaster"
          onChange={(event) => onChange({ roaster: event.target.value })}
          value={draft.roaster}
        />
      </div>
      <ChoiceChips
        label="Roast level"
        onChange={(roastLevel) => {
          if (roastLevel) {
            onChange({ roastLevel })
          }
        }}
        options={ROAST_OPTIONS}
        value={draft.roastLevel}
      />
      <div className={`field${errors.roastDate ? ' field--error' : ''}`}>
        <label className="field__label" htmlFor="bean-roast-date">
          Roast date (optional)
        </label>
        <input
          className="input"
          id="bean-roast-date"
          onChange={(event) => onChange({ roastDate: event.target.value })}
          type="date"
          value={draft.roastDate}
        />
        {errors.roastDate ? <p className="field__error">{errors.roastDate}</p> : null}
      </div>
      <div className="field">
        <label className="field__label" htmlFor="bean-notes">
          Notes (optional)
        </label>
        <textarea
          className="textarea"
          id="bean-notes"
          onChange={(event) => onChange({ notes: event.target.value })}
          rows={2}
          value={draft.notes}
        />
      </div>
    </div>
  )
}
