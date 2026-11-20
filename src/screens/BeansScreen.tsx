import { useState } from 'react'
import { BeanRow } from '../components/BeanRow'
import { Sheet } from '../components/Sheet'
import type { Bean, Shot } from '../domain/schemas'
import { useData } from '../hooks/DataContext'
import { BeanEditor } from './BeanEditor'

type Editing = { bean?: Bean } | null

function countByBean(shots: ReadonlyArray<Shot>): Map<string, number> {
  const counts = new Map<string, number>()
  for (const shot of shots) {
    counts.set(shot.beanId, (counts.get(shot.beanId) ?? 0) + 1)
  }
  return counts
}

export function BeansScreen() {
  const { beans, saveBean, shots } = useData()
  const [editing, setEditing] = useState<Editing>(null)
  const counts = countByBean(shots)
  const sorted = beans.toSorted((a, b) => a.name.localeCompare(b.name, 'en-GB'))
  const active = sorted.filter((bean) => !bean.archived)
  const archived = sorted.filter((bean) => bean.archived)

  const renderRow = (bean: Bean) => (
    <BeanRow
      bean={bean}
      key={bean.id}
      onEdit={() => setEditing({ bean })}
      onToggleArchive={() => {
        void saveBean({ ...bean, archived: !bean.archived })
      }}
      shotCount={counts.get(bean.id) ?? 0}
    />
  )

  return (
    <div className="screen">
      <header className="screen__header screen__header--row">
        <h1>Beans</h1>
        <button className="btn btn--primary" onClick={() => setEditing({})} type="button">
          Add bean
        </button>
      </header>
      <section className="card">
        {active.length === 0 ? (
          <p className="muted">No active beans. Add the one you’re dialling in.</p>
        ) : (
          <ul className="bean-list">{active.map(renderRow)}</ul>
        )}
      </section>
      {archived.length > 0 ? (
        <details className="card">
          <summary>Archived ({archived.length})</summary>
          <ul className="bean-list">{archived.map(renderRow)}</ul>
        </details>
      ) : null}
      <Sheet onClose={() => setEditing(null)} open={editing != null} title={editing?.bean ? 'Edit bean' : 'New bean'}>
        {editing ? <BeanEditor bean={editing.bean} key={editing.bean?.id ?? 'new'} onDone={() => setEditing(null)} /> : null}
      </Sheet>
    </div>
  )
}
