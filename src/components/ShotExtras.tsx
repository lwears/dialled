import type { Rating } from '../domain/schemas'
import { ChoiceChips } from './ChoiceChips'

const RATING_OPTIONS = ([1, 2, 3, 4, 5] as const).map((rating) => ({ label: `${rating}★`, value: rating }))

export function ShotExtras({
  notes,
  onDone,
  onNotesChange,
  onRatingChange,
  rating,
}: {
  notes: string
  onDone: () => void
  onNotesChange: (notes: string) => void
  onRatingChange: (rating: Rating | undefined) => void
  rating: Rating | undefined
}) {
  return (
    <div className="stack">
      <ChoiceChips<Rating>
        allowDeselect
        className="chips--even"
        label="Rating (optional)"
        onChange={onRatingChange}
        options={RATING_OPTIONS}
        value={rating}
      />
      <div className="field">
        <label className="field__label" htmlFor="log-notes">
          Notes (optional)
        </label>
        <textarea
          className="textarea"
          id="log-notes"
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Puck, flavour, anything worth remembering"
          rows={4}
          value={notes}
        />
      </div>
      <button className="btn btn--primary btn--block btn--large" onClick={onDone} type="button">
        Done
      </button>
    </div>
  )
}
