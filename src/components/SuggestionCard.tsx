import { formatNumber } from '../domain/format'
import { formatRatio } from '../domain/ratio'
import type { Suggestion } from '../domain/suggest'

export function SuggestionDetails({
  suggestion,
}: {
  suggestion: Pick<Suggestion, 'headline' | 'next' | 'reason' | 'warnings'>
}) {
  const { next } = suggestion
  return (
    <>
      <h2 className="suggestion__headline">{suggestion.headline}</h2>
      <p className="suggestion__reason">{suggestion.reason}</p>
      {suggestion.warnings.map((warning) => (
        <p className="suggestion__warning" key={warning}>
          <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="18">
            <path d="M12 4l9 16H3L12 4z" />
            <path d="M12 10v4M12 17v.5" />
          </svg>
          {warning}
        </p>
      ))}
      <p className="suggestion__recipe">
        {formatNumber(next.doseInG)}g in → {formatNumber(next.yieldOutG)}g out{' '}
        <span className="suggestion__ratio">({formatRatio(next.doseInG, next.yieldOutG)})</span> · grind{' '}
        {next.grindSetting}
      </p>
    </>
  )
}

export function SuggestionCard({
  askLabel,
  onApply,
  onAskClaude,
  onDismiss,
  suggestion,
}: {
  askLabel: string
  onApply: () => void
  onAskClaude: (() => void) | null
  onDismiss: () => void
  suggestion: Suggestion
}) {
  return (
    <div aria-live="polite" className="suggestion" role="status">
      <p className="suggestion__eyebrow">Next shot</p>
      <SuggestionDetails suggestion={suggestion} />
      {onAskClaude ? (
        <button className="suggestion__ask" onClick={onAskClaude} type="button">
          {askLabel}
        </button>
      ) : null}
      <div className="suggestion__actions">
        <button className="btn btn--outline suggestion__dismiss" onClick={onDismiss} type="button">
          Dismiss
        </button>
        <button className="btn btn--primary suggestion__apply" onClick={onApply} type="button">
          Use for next shot
        </button>
      </div>
    </div>
  )
}

export function PastSuggestion({ suggestion }: { suggestion: Suggestion }) {
  return (
    <section aria-label="Suggestion after this shot" className="suggestion suggestion--past">
      <p className="suggestion__eyebrow">Suggested after this shot</p>
      <SuggestionDetails suggestion={suggestion} />
    </section>
  )
}
