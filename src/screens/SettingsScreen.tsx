import { useState } from 'react'
import { ChoiceChips } from '../components/ChoiceChips'
import { ScreenDiagnostics } from '../components/ScreenDiagnostics'
import { BACKUP_REMINDER_DAYS } from '../domain/constants'
import { formatDate } from '../domain/format'
import { useBackup } from '../hooks/useBackup'
import { useBackupReminder } from '../hooks/useBackupReminder'
import { useData } from '../hooks/DataContext'
import { usePersistence } from '../hooks/usePersistence'
import { measureScreen } from '../lib/diagnostics'

const GRIND_STEPS = [0.1, 0.25, 0.5, 1].map((step) => ({ label: String(step), value: step }))

const PERSISTENCE_TEXT = {
  'best-effort': "Best effort. Your browser may clear data if the phone runs low on space, so keep backups.",
  checking: 'Checking…',
  persistent: 'Persistent. Your browser has agreed not to clear this data automatically.',
  unsupported: "Your browser can't promise to keep data, so keep backups.",
} as const

export function SettingsScreen() {
  const { beans, saveSettings, settings, shots } = useData()
  const backup = useBackup()
  const overdue = useBackupReminder()
  const persistence = usePersistence()
  const { status } = backup
  const [diagnostics, setDiagnostics] = useState<Array<[string, string]> | null>(null)

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>Settings</h1>
      </header>

      <ScreenDiagnostics onMeasure={() => setDiagnostics(measureScreen())} rows={diagnostics} />

      <section className="card stack">
        <h2>Grinder</h2>
        <ChoiceChips
          label="One grind step on the Niche scale"
          onChange={(grindStep) => {
            if (grindStep) {
              void saveSettings({ ...settings, grindStep })
            }
          }}
          options={GRIND_STEPS}
          value={settings.grindStep}
        />
      </section>

      <section className="card stack">
        <h2>Backup</h2>
        <p>
          Last backed up: <strong>{settings.lastBackupAt ? formatDate(settings.lastBackupAt) : 'never'}</strong>
        </p>
        {overdue ? (
          <p className="notice">
            It’s been over {BACKUP_REMINDER_DAYS} days. Your shots live only on this phone, so a quick backup to
            Files or iCloud Drive is worth it.
          </p>
        ) : null}
        <p className="muted small">
          {beans.length} {beans.length === 1 ? 'bean' : 'beans'}, {shots.length} {shots.length === 1 ? 'shot' : 'shots'}{' '}
          stored on this device.
        </p>
        <button className="btn btn--primary btn--block" onClick={() => void backup.exportJson()} type="button">
          Export backup (JSON)
        </button>
        <button className="btn btn--block" onClick={() => void backup.exportCsv()} type="button">
          Export shots (CSV)
        </button>
        <label className="btn btn--block file-btn">
          Import backup (JSON)
          <input
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) {
                void backup.chooseImportFile(file)
              }
            }}
            type="file"
          />
        </label>

        {status.kind === 'confirmImport' ? (
          <div className="notice stack">
            <p>
              Import {status.data.beans.length} beans and {status.data.shots.length} shots from{' '}
              {formatDate(status.data.exportedAt)}? Items with the same ID are replaced; nothing is deleted.
            </p>
            <div className="actions">
              <button className="btn btn--primary" onClick={() => void backup.confirmImport(status.data)} type="button">
                Import
              </button>
              <button className="btn btn--ghost" onClick={backup.cancelImport} type="button">
                Cancel
              </button>
            </div>
          </div>
        ) : null}
        {status.kind === 'message' ? <p role="status">{status.text}</p> : null}
        {status.kind === 'error' ? (
          <p className="field__error" role="alert">
            {status.text}
          </p>
        ) : null}
      </section>

      <section className="card stack">
        <h2>Storage</h2>
        <p className="muted small">{PERSISTENCE_TEXT[persistence]}</p>
      </section>

      <p className="muted small center">Dialled · everything stays on this device.</p>
    </div>
  )
}
