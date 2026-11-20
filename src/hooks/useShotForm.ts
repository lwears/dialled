import { useCallback, useState } from 'react'
import { shotFromDraft } from '../domain/shotDraft'
import type { DraftErrors, ShotDraft } from '../domain/shotDraft'
import type { Shot } from '../domain/schemas'

export interface ShotForm {
  draft: ShotDraft
  errors: DraftErrors
  update: (patch: Partial<ShotDraft>) => void
  replace: (draft: ShotDraft) => void
  validate: (id: string, createdAt: string) => Shot | null
}

export function useShotForm(initial: () => ShotDraft): ShotForm {
  const [draft, setDraft] = useState(initial)
  const [errors, setErrors] = useState<DraftErrors>({})

  const update = useCallback((patch: Partial<ShotDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch)) {
        delete next[key as keyof DraftErrors]
      }
      return next
    })
  }, [])

  const replace = useCallback((next: ShotDraft) => {
    setDraft(next)
    setErrors({})
  }, [])

  const validate = useCallback(
    (id: string, createdAt: string) => {
      const result = shotFromDraft(draft, id, createdAt)
      if (result.ok) {
        setErrors({})
        return result.shot
      }
      setErrors(result.errors)
      return null
    },
    [draft],
  )

  return { draft, errors, replace, update, validate }
}
