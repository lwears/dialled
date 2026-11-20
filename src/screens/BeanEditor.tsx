import { useState } from 'react'
import { BeanFields } from '../components/BeanFields'
import type { BeanDraft, BeanErrors } from '../components/BeanFields'
import { beanSchema } from '../domain/schemas'
import type { Bean } from '../domain/schemas'
import { useData } from '../hooks/DataContext'
import { newId } from '../lib/files'

function toDraft(bean: Bean | undefined): BeanDraft {
  return {
    name: bean?.name ?? '',
    notes: bean?.notes ?? '',
    roastDate: bean?.roastDate ?? '',
    roastLevel: bean?.roastLevel ?? 'medium',
    roaster: bean?.roaster ?? '',
  }
}

export function BeanEditor({ bean, onDone }: { bean?: Bean; onDone: (saved: Bean | null) => void }) {
  const { saveBean } = useData()
  const [draft, setDraft] = useState(() => toDraft(bean))
  const [errors, setErrors] = useState<BeanErrors>({})

  const submit = async () => {
    const result = beanSchema.safeParse({
      archived: bean?.archived ?? false,
      id: bean?.id ?? newId(),
      name: draft.name,
      notes: draft.notes,
      roastDate: draft.roastDate || undefined,
      roastLevel: draft.roastLevel,
      roaster: draft.roaster,
    })
    if (!result.success) {
      const next: BeanErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (key === 'name' || key === 'roastDate') {
          next[key] ??= issue.message
        }
      }
      setErrors(next)
      return
    }
    await saveBean(result.data)
    onDone(result.data)
  }

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <BeanFields
        draft={draft}
        errors={errors}
        onChange={(patch) => {
          setDraft((current) => ({ ...current, ...patch }))
          setErrors({})
        }}
      />
      <div className="actions">
        <button className="btn btn--primary btn--block" type="submit">
          {bean ? 'Save bean' : 'Add bean'}
        </button>
      </div>
    </form>
  )
}
