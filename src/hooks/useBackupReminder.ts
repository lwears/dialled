import { useState } from 'react'
import { needsBackupReminder } from '../domain/backup'
import { useData } from './DataContext'

export function useBackupReminder(): boolean {
  const { beans, settings, shots } = useData()
  const [now] = useState(() => new Date())
  return needsBackupReminder(settings, beans.length > 0 || shots.length > 0, now)
}
