import { useState } from 'react'
import { CLAUDE_MODEL } from '../ai/claude'
import { ChoiceChips } from '../components/ChoiceChips'
import { BACKUP_REMINDER_DAYS } from '../domain/constants'
import { formatDate, formatDateTime } from '../domain/format'
import { useBackup } from '../hooks/useBackup'
import { useBackupReminder } from '../hooks/useBackupReminder'
import { useData } from '../hooks/DataContext'
import { usePersistence } from '../hooks/usePersistence'

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
  const [keyDraft, setKeyDraft] = useState('')
  const savedKey = settings.anthropicApiKey

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>Settings</h1>
      </header>

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
        <h2>Claude</h2>
        <p className="muted small">
          Add a Claude API key to ask Claude ({CLAUDE_MODEL}) for a second opinion after a shot. The key stays on
          this phone and isn’t included in backups. When you ask, the shot and recent shots for that bean are sent to
          Anthropic. Each answer costs roughly a penny of API credit.
        </p>
        {savedKey ? (
          <>
            <p>
              Key saved: <strong>…{savedKey.slice(-4)}</strong>
            </p>
            <button
              className="btn btn--block"
              onClick={() => void saveSettings({ ...settings, anthropicApiKey: undefined })}
              type="button"
            >
              Remove key
            </button>
          </>
        ) : (
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault()
              const key = keyDraft.trim()
              if (key) {
                void saveSettings({ ...settings, anthropicApiKey: key })
                setKeyDraft('')
              }
            }}
          >
            <div className="field">
              <label className="field__label" htmlFor="claude-key">
                API key
              </label>
              <input
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="input"
                id="claude-key"
                onChange={(event) => setKeyDraft(event.target.value)}
                placeholder="sk-ant-…"
                spellCheck={false}
                type="password"
                value={keyDraft}
              />
            </div>
            <button className="btn btn--primary btn--block" disabled={!keyDraft.trim()} type="submit">
              Save key
            </button>
          </form>
        )}
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

      <p className="muted small center">
        Dialled · your data stays on this device
        <br />
        Build {formatDateTime(__BUILD_TIME__)}
      </p>
    </div>
  )
}
