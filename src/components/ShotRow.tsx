import { formatDateTime, formatNumber } from '../domain/format'
import { formatRatio } from '../domain/ratio'
import { TASTE_LABELS } from '../domain/schemas'
import type { Shot } from '../domain/schemas'

export function ShotRow({ onSelect, shot }: { onSelect: () => void; shot: Shot }) {
  return (
    <li>
      <button className="shot-row" onClick={onSelect} type="button">
        <span className="shot-row__main">
          <span className="shot-row__recipe">
            {formatNumber(shot.doseInG)}g → {formatNumber(shot.yieldOutG)}g · {formatNumber(shot.timeSec)}s · grind{' '}
            {shot.grindSetting}
          </span>
          <span className="shot-row__meta">
            {formatDateTime(shot.createdAt)} · {formatRatio(shot.doseInG, shot.yieldOutG)}
            {shot.rating ? ` · ${'★'.repeat(shot.rating)}` : ''}
          </span>
        </span>
        <span className={`tag tag--${shot.taste}`}>{TASTE_LABELS[shot.taste]}</span>
      </button>
    </li>
  )
}
