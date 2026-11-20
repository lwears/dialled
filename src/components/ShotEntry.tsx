import type { Taste } from '../domain/schemas'
import { ScaleField } from './ScaleField'
import { TasteGrid } from './TasteGrid'

export function ShotEntry({
  errors,
  hasExtras,
  onOpenExtras,
  onTasteChange,
  onTimeChange,
  onYieldChange,
  ratioText,
  saving,
  taste,
  time,
  yieldHint,
  yieldOut,
}: {
  errors: { time?: string; taste?: string; yieldOut?: string }
  hasExtras: boolean
  onOpenExtras: () => void
  onTasteChange: (taste: Taste) => void
  onTimeChange: (value: string) => void
  onYieldChange: (value: string) => void
  ratioText: string
  saving: boolean
  taste: Taste | undefined
  time: string
  yieldHint?: string
  yieldOut: string
}) {
  return (
    <>
      <div className="shot-entry__scale">
        <div className="dock__header">
          <h2 className="dock__label">From your scale</h2>
          <span className="dock__ratio">Ratio {ratioText}</span>
        </div>
        <div className="shot-entry__fields">
          <ScaleField
            error={errors.yieldOut}
            id="log-yield"
            label={yieldHint ? `Yield out · aim ${yieldHint}` : 'Yield out'}
            onChange={onYieldChange}
            unit="g"
            value={yieldOut}
          />
          <ScaleField error={errors.time} id="log-time" label="Shot time" onChange={onTimeChange} unit="s" value={time} />
        </div>
      </div>
      <TasteGrid error={errors.taste} onChange={onTasteChange} value={taste} />
      <div className="shot-entry__actions">
        <button
          aria-label={hasExtras ? 'Edit rating and notes' : 'Add rating and notes'}
          className="btn btn--outline shot-entry__extras"
          onClick={onOpenExtras}
          type="button"
        >
          <svg aria-hidden="true" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="22">
            <path d="M5 19h4L19 9l-4-4L5 15v4z" />
            <path d="M13 7l4 4" />
          </svg>
          {hasExtras ? <span className="shot-entry__dot" /> : null}
        </button>
        <button className="btn btn--primary shot-entry__save" disabled={saving} type="submit">
          Save shot
        </button>
      </div>
    </>
  )
}
