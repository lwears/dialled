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
    <section aria-live="polite" className={`card suggestion suggestion--${suggestion.kind}`}>
      <p className="suggestion__eyebrow">Next shot</p>
      <h2 className="suggestion__headline">{suggestion.headline}</h2>
      <p className="suggestion__reason">{suggestion.reason}</p>
      {suggestion.warnings.map((warning) => (
        <p className="suggestion__warning" key={warning}>
          {warning}
        </p>
      ))}
      <p className="suggestion__recipe">
        {formatNumber(next.doseInG)}g in → {formatNumber(next.yieldOutG)}g out ({formatRatio(next.doseInG, next.yieldOutG)})
        · grind {next.grindSetting}
      </p>
      <div className="suggestion__actions">
        <button className="btn btn--primary" onClick={onApply} type="button">
          Use for next shot
        </button>
        <button className="btn btn--ghost" onClick={onDismiss} type="button">
          Dismiss
        </button>
      </div>
    </section>
  )
}
