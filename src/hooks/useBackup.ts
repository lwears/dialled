import { useState } from 'react'
import { buildExport, parseExport, shotsToCsv } from '../domain/backup'
import type { ExportData } from '../domain/schemas'
import { saveFile } from '../lib/files'
import { useData } from './DataContext'

export type BackupStatus =
  | { kind: 'idle' }
  | { kind: 'message'; text: string }
  | { kind: 'error'; text: string }
  | { kind: 'confirmImport'; data: ExportData }

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useBackup() {
  const { beans, importData, saveSettings, settings, shots } = useData()
  const [status, setStatus] = useState<BackupStatus>({ kind: 'idle' })

  const exportJson = async () => {
    const now = new Date()
    const json = JSON.stringify(buildExport(beans, shots, settings, now), null, 2)
    const outcome = await saveFile(`dialled-backup-${today()}.json`, json, 'application/json')
    if (outcome === 'saved') {
      await saveSettings({ ...settings, lastBackupAt: now.toISOString() })
      setStatus({ kind: 'message', text: 'Backup saved.' })
    }
  }

  const exportCsv = async () => {
    await saveFile(`dialled-shots-${today()}.csv`, shotsToCsv(shots, beans), 'text/csv')
  }

  const chooseImportFile = async (file: File) => {
    const result = parseExport(await file.text())
    setStatus(result.ok ? { data: result.data, kind: 'confirmImport' } : { kind: 'error', text: result.error })
  }

  const confirmImport = async (data: ExportData) => {
    try {
      await importData(data)
      setStatus({ kind: 'message', text: `Imported ${data.beans.length} bean(s) and ${data.shots.length} shot(s).` })
    } catch (error) {
      setStatus({ kind: 'error', text: `Import failed: ${String(error)}` })
    }
  }

  return {
    cancelImport: () => setStatus({ kind: 'idle' }),
    chooseImportFile,
    confirmImport,
    exportCsv,
    exportJson,
    status,
  }
}
