import { formatDate } from '../domain/format'
import { ROAST_LABELS } from '../domain/schemas'
import type { Bean } from '../domain/schemas'

export function BeanRow({
  bean,
  onEdit,
  onToggleArchive,
  shotCount,
}: {
  bean: Bean
  onEdit: () => void
  onToggleArchive: () => void
  shotCount: number
}) {
  return (
    <li className="bean-row">
      <div className="bean-row__main">
        <strong>{bean.name}</strong>
        <span className="muted small">
          {[
            bean.roaster,
            ROAST_LABELS[bean.roastLevel],
            bean.roastDate ? `roasted ${formatDate(bean.roastDate)}` : '',
            `${shotCount} ${shotCount === 1 ? 'shot' : 'shots'}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      <div className="bean-row__actions">
        <button className="btn btn--ghost" onClick={onEdit} type="button">
          Edit
        </button>
        <button className="btn btn--ghost" onClick={onToggleArchive} type="button">
          {bean.archived ? 'Restore' : 'Archive'}
        </button>
      </div>
    </li>
  )
}
