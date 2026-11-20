import { GRIND_MAX, GRIND_MIN } from '../domain/constants'
import { formatRatio } from '../domain/ratio'
import { ROAST_LABELS, TASTE_LABELS, TASTES } from '../domain/schemas'
import type { Bean, Rating } from '../domain/schemas'
import type { DraftErrors, ShotDraft } from '../domain/shotDraft'
import { ChoiceChips } from './ChoiceChips'
import { Stepper } from './Stepper'

const TASTE_OPTIONS = TASTES.map((taste) => ({ label: TASTE_LABELS[taste], value: taste }))
const RATING_OPTIONS = ([1, 2, 3, 4, 5] as const).map((rating) => ({ label: `${rating}★`, value: rating }))

export const NEW_BEAN_VALUE = '__new__'

export function ShotFields({
  beans,
  draft,
  errors,
  grindStep,
  idPrefix,
  onChange,
  onNewBean,
}: {
  beans: ReadonlyArray<Bean>
  draft: ShotDraft
  errors: DraftErrors
  grindStep: number
  idPrefix: string
  onChange: (patch: Partial<ShotDraft>) => void
  onNewBean?: () => void
}) {
  const dose = Number(draft.dose.replace(',', '.'))
  const yieldOut = Number(draft.yieldOut.replace(',', '.'))
  const grindDecimals = String(grindStep).split('.')[1]?.length ?? 0

  return (
    <div className="shot-fields">
      <div className={`field${errors.beanId ? ' field--error' : ''}`}>
        <label className="field__label" htmlFor={`${idPrefix}-bean`}>
          Bean
        </label>
        <select
          className="select"
          id={`${idPrefix}-bean`}
          onChange={(event) => {
            if (event.target.value === NEW_BEAN_VALUE) {
              onNewBean?.()
            } else {
              onChange({ beanId: event.target.value })
            }
          }}
          value={draft.beanId}
        >
          {draft.beanId === '' ? <option value="">Choose a bean…</option> : null}
          {beans.map((bean) => (
            <option key={bean.id} value={bean.id}>
              {bean.name}
              {bean.roaster ? ` · ${bean.roaster}` : ''} ({ROAST_LABELS[bean.roastLevel].toLowerCase()})
            </option>
          ))}
          {onNewBean ? <option value={NEW_BEAN_VALUE}>+ Add a new bean…</option> : null}
        </select>
        {errors.beanId ? <p className="field__error">{errors.beanId}</p> : null}
      </div>

      <div className="grid-2">
        <Stepper
          error={errors.dose}
          id={`${idPrefix}-dose`}
          label="Dose in"
          max={40}
          onChange={(value) => onChange({ dose: value })}
          step={0.5}
          unit="g"
          value={draft.dose}
        />
        <Stepper
          decimals={0}
          error={errors.yieldOut}
          id={`${idPrefix}-yield`}
          label="Yield out"
          max={150}
          onChange={(value) => onChange({ yieldOut: value })}
          step={1}
          unit="g"
          value={draft.yieldOut}
        />
      </div>
      <p className="ratio" aria-live="polite">
        Ratio <strong>{Number.isFinite(dose) && Number.isFinite(yieldOut) ? formatRatio(dose, yieldOut) : '1:–'}</strong>
      </p>

      <Stepper
        decimals={grindDecimals}
        error={errors.grind}
        id={`${idPrefix}-grind`}
        label="Grind (Niche)"
        max={GRIND_MAX}
        min={GRIND_MIN}
        onChange={(value) => onChange({ grind: value })}
        step={grindStep}
        value={draft.grind}
      />

      <Stepper
        decimals={1}
        error={errors.time}
        id={`${idPrefix}-time`}
        label="Shot time"
        max={300}
        onChange={(value) => onChange({ time: value })}
        step={1}
        unit="s"
        value={draft.time}
      />

      <ChoiceChips
        error={errors.taste}
        label="Taste"
        onChange={(taste) => onChange({ taste })}
        options={TASTE_OPTIONS}
        value={draft.taste}
      />

      <ChoiceChips<Rating>
        allowDeselect
        className="chips--even"
        label="Rating (optional)"
        onChange={(rating) => onChange({ rating })}
        options={RATING_OPTIONS}
        value={draft.rating}
      />

      <div className="field">
        <label className="field__label" htmlFor={`${idPrefix}-notes`}>
          Notes (optional)
        </label>
        <textarea
          className="textarea"
          id={`${idPrefix}-notes`}
          onChange={(event) => onChange({ notes: event.target.value })}
          rows={2}
          value={draft.notes}
        />
      </div>
    </div>
  )
}
