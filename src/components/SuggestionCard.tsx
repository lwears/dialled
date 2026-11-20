import { formatNumber } from '../domain/format'
import { formatRatio } from '../domain/ratio'
import type { Suggestion } from '../domain/suggest'

export function SuggestionCard({
  onApply,
  onDismiss,
  suggestion,
}: {
  onApply: () => void
  onDismiss: () => void
  suggestion: Suggestion
}) {
  const { next } = suggestion
  return (
    <div aria-live="polite" className="suggestion" role="status">
      <p className="suggestion__eyebrow">Next shot</p>
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
