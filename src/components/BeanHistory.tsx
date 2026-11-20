import { useState } from 'react'
import { formatDateTime } from '../domain/format'
import { ROAST_LABELS } from '../domain/schemas'
import type { Shot } from '../domain/schemas'
import type { BeanShotGroup } from '../domain/shots'
import { TIME } from '../domain/suggest'
import { ShotRow } from './ShotRow'
import { Sparkline } from './Sparkline'

const TREND_SHOTS = 10
const INITIAL_VISIBLE = 10

export function BeanHistory({ group, onSelect }: { group: BeanShotGroup; onSelect: (shot: Shot) => void }) {
  const [expanded, setExpanded] = useState(false)
  const recent = group.shots.slice(0, TREND_SHOTS).toReversed()
  const labels = recent.map((shot) => formatDateTime(shot.createdAt))
  const visible = expanded ? group.shots : group.shots.slice(0, INITIAL_VISIBLE)

  return (
    <section className="card bean-history">
      <header className="bean-history__header">
        <h2>{group.bean?.name ?? 'Unknown bean'}</h2>
        <p className="muted small">
          {group.bean ? `${group.bean.roaster ? `${group.bean.roaster} · ` : ''}${ROAST_LABELS[group.bean.roastLevel]} · ` : ''}
          {group.shots.length} {group.shots.length === 1 ? 'shot' : 'shots'}
          {group.bean?.archived ? ' · archived' : ''}
        </p>
      </header>
      {recent.length > 1 ? (
        <div className="bean-history__trends">
          <Sparkline
            band={{ from: TIME.targetMin, to: TIME.targetMax }}
            labels={labels}
            title={`Time, last ${recent.length}`}
            unit="s"
            values={recent.map((shot) => shot.timeSec)}
          />
          <Sparkline
            labels={labels}
            title={`Grind, last ${recent.length}`}
            values={recent.map((shot) => shot.grindSetting)}
          />
        </div>
      ) : null}
      <ul className="shot-list">
        {visible.map((shot) => (
          <ShotRow key={shot.id} onSelect={() => onSelect(shot)} shot={shot} />
        ))}
      </ul>
      {group.shots.length > INITIAL_VISIBLE ? (
        <button className="btn btn--ghost btn--block" onClick={() => setExpanded((value) => !value)} type="button">
          {expanded ? 'Show fewer' : `Show all ${group.shots.length}`}
        </button>
      ) : null}
    </section>
  )
}
