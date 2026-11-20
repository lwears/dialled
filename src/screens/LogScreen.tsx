import { useState } from 'react'
import { BackupBanner } from '../components/BackupBanner'
import { Sheet } from '../components/Sheet'
import { ShotFields } from '../components/ShotFields'
import { StopwatchButton } from '../components/StopwatchButton'
import { SuggestionCard } from '../components/SuggestionCard'
import { formatNumber } from '../domain/format'
import { TASTE_LABELS } from '../domain/schemas'
import { draftFromPrefill } from '../domain/shotDraft'
import { activeBeans, defaultBeanId, lastShotForBean, prefillForBean } from '../domain/shots'
import { suggestNextStep } from '../domain/suggest'
import type { Suggestion } from '../domain/suggest'
import { useBackupReminder } from '../hooks/useBackupReminder'
import { useData } from '../hooks/DataContext'
import { navigate } from '../hooks/useHashRoute'
import { useShotForm } from '../hooks/useShotForm'
import { useStopwatch } from '../hooks/useStopwatch'
import { newId } from '../lib/files'
import { BeanEditor } from './BeanEditor'

export function LogScreen() {
  const { beans, saveShot, settings, shots } = useData()
  const beanOptions = activeBeans(beans)
  const form = useShotForm(() => {
    const beanId = defaultBeanId(beans, shots)
    return draftFromPrefill(beanId, prefillForBean(beanId, shots))
  })
  const stopwatch = useStopwatch()
  const showBackupReminder = useBackupReminder()
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [addingBean, setAddingBean] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectBean = (beanId: string) => {
    const prefill = prefillForBean(beanId, shots)
    form.update({
      beanId,
      dose: formatNumber(prefill.doseInG),
      grind: String(prefill.grindSetting),
      yieldOut: formatNumber(prefill.yieldOutG),
    })
  }

  const toggleTimer = () => {
    const totalMs = stopwatch.toggle()
    if (totalMs != null) {
      form.update({ time: (totalMs / 1000).toFixed(1) })
    }
  }

  const save = async () => {
    const shot = form.validate(newId(), new Date().toISOString())
    const bean = beans.find((candidate) => candidate.id === shot?.beanId)
    if (!shot || !bean) {
      return
    }
    setSaving(true)
    try {
      await saveShot(shot)
      setSuggestion(suggestNextStep(shot, shots, bean, { grindStep: settings.grindStep }))
      form.replace(draftFromPrefill(shot.beanId, shot))
      stopwatch.reset()
      window.scrollTo({ behavior: 'smooth', top: 0 })
    } finally {
      setSaving(false)
    }
  }

  const lastShot = lastShotForBean(form.draft.beanId, shots)

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>Log a shot</h1>
      </header>

      {showBackupReminder ? <BackupBanner onOpen={() => navigate('settings')} /> : null}

      {suggestion ? (
        <SuggestionCard
          onApply={() => {
            form.update({
              dose: formatNumber(suggestion.next.doseInG),
              grind: String(suggestion.next.grindSetting),
              yieldOut: formatNumber(suggestion.next.yieldOutG),
            })
            setSuggestion(null)
          }}
          onDismiss={() => setSuggestion(null)}
          suggestion={suggestion}
        />
      ) : null}

      {beanOptions.length === 0 ? (
        <section className="card empty">
          <h2>Add your first bean</h2>
          <p>Shots are logged against a bean, so start by adding the one in your hopper.</p>
          <button className="btn btn--primary btn--block" onClick={() => setAddingBean(true)} type="button">
            Add a bean
          </button>
        </section>
      ) : (
        <form
          className="stack"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          {lastShot ? (
            <p className="muted small">
              Last with this bean: {formatNumber(lastShot.doseInG)}g → {formatNumber(lastShot.yieldOutG)}g in{' '}
              {formatNumber(lastShot.timeSec)}s at {lastShot.grindSetting}, {TASTE_LABELS[lastShot.taste].toLowerCase()}
            </p>
          ) : null}
          <ShotFields
            beans={beanOptions}
            draft={form.draft}
            errors={form.errors}
            grindStep={settings.grindStep}
            idPrefix="log"
            onChange={(patch) => {
              if (patch.beanId != null && patch.beanId !== form.draft.beanId) {
                selectBean(patch.beanId)
              } else {
                form.update(patch)
              }
            }}
            onNewBean={() => setAddingBean(true)}
            timer={
              <StopwatchButton
                elapsedMs={stopwatch.elapsedMs}
                onReset={stopwatch.reset}
                onToggle={toggleTimer}
                running={stopwatch.running}
              />
            }
          />
          <div className="actions actions--sticky">
            <button className="btn btn--primary btn--block btn--large" disabled={saving} type="submit">
              Save shot
            </button>
          </div>
        </form>
      )}

      <Sheet onClose={() => setAddingBean(false)} open={addingBean} title="New bean">
        <BeanEditor
          onDone={(bean) => {
            setAddingBean(false)
            if (bean) {
              selectBean(bean.id)
            }
          }}
        />
      </Sheet>
    </div>
  )
}
