import { createContext, use, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Bean, ExportData, Settings, Shot } from '../domain/schemas'
import type { Repository, Snapshot } from '../storage/repository'

interface DataActions {
  saveShot: (shot: Shot) => Promise<void>
  deleteShot: (id: string) => Promise<void>
  saveBean: (bean: Bean) => Promise<void>
  saveSettings: (settings: Settings) => Promise<void>
  importData: (data: ExportData) => Promise<void>
}

type DataValue = Snapshot & DataActions

const DataContext = createContext<DataValue | null>(null)

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; snapshot: Snapshot }

export function DataProvider({ children, repository }: { children: ReactNode; repository: Repository }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    repository.load().then(
      (snapshot) => {
        if (active) {
          setState({ snapshot, status: 'ready' })
        }
      },
      (error: unknown) => {
        if (active) {
          setState({ message: String(error), status: 'error' })
        }
      },
    )
    return () => {
      active = false
    }
  }, [repository])

  const actions = useMemo<DataActions>(() => {
    const run = async (write: () => Promise<void>) => {
      await write()
      const snapshot = await repository.load()
      setState({ snapshot, status: 'ready' })
    }
    return {
      deleteShot: (id) => run(() => repository.deleteShot(id)),
      importData: (data) => run(() => repository.importData(data)),
      saveBean: (bean) => run(() => repository.saveBean(bean)),
      saveSettings: (settings) => run(() => repository.saveSettings(settings)),
      saveShot: (shot) => run(() => repository.saveShot(shot)),
    }
  }, [repository])

  const value = useMemo(
    () => (state.status === 'ready' ? { ...state.snapshot, ...actions } : null),
    [state, actions],
  )

  if (state.status === 'loading') {
    return <div className="splash">Loading…</div>
  }
  if (state.status === 'error' || !value) {
    return (
      <div className="splash">
        Couldn’t open your data. {state.status === 'error' ? state.message : ''}
      </div>
    )
  }
  return <DataContext value={value}>{children}</DataContext>
}

export function useData(): DataValue {
  const value = use(DataContext)
  if (!value) {
    throw new Error('useData must be used inside DataProvider')
  }
  return value
}
