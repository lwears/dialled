export type PersistenceState = 'persistent' | 'best-effort' | 'unsupported'

export async function requestPersistentStorage(): Promise<PersistenceState> {
  if (!navigator.storage?.persist) {
    return 'unsupported'
  }
  try {
    if (await navigator.storage.persisted()) {
      return 'persistent'
    }
    return (await navigator.storage.persist()) ? 'persistent' : 'best-effort'
  } catch {
    return 'best-effort'
  }
}
