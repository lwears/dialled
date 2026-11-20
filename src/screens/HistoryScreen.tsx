import { useState } from 'react'
import { BeanHistory } from '../components/BeanHistory'
import { Sheet } from '../components/Sheet'
import type { Shot } from '../domain/schemas'
import { groupShotsByBean } from '../domain/shots'
import { useData } from '../hooks/DataContext'
import { ShotEditor } from './ShotEditor'

export function HistoryScreen() {
  const { beans, shots } = useData()
  const [editing, setEditing] = useState<Shot | null>(null)
  const groups = groupShotsByBean(shots, beans)

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>History</h1>
      </header>
      {groups.length === 0 ? (
        <section className="card empty">
          <p>No shots yet. Your logged shots will appear here, grouped by bean.</p>
        </section>
      ) : (
        groups.map((group) => <BeanHistory group={group} key={group.beanId} onSelect={setEditing} />)
      )}
      <Sheet onClose={() => setEditing(null)} open={editing != null} title="Edit shot">
        {editing ? <ShotEditor key={editing.id} onDone={() => setEditing(null)} shot={editing} /> : null}
      </Sheet>
    </div>
  )
}
