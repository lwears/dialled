import { useEffect, useState } from 'react'
import { requestPersistentStorage } from '../storage/persist'
import type { PersistenceState } from '../storage/persist'

let pending: Promise<PersistenceState> | undefined

export function usePersistence(): PersistenceState | 'checking' {
  const [state, setState] = useState<PersistenceState | 'checking'>('checking')
  useEffect(() => {
    let active = true
    pending ??= requestPersistentStorage()
    void pending.then((result) => {
      if (active) {
        setState(result)
      }
    })
    return () => {
      active = false
    }
  }, [])
  return state
}
