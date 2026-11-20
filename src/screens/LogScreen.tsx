import { useState } from 'react'
import { BackupBanner } from '../components/BackupBanner'
import { BeanSelect } from '../components/BeanSelect'
import { Dock } from '../components/Dock'
import { Sheet } from '../components/Sheet'
import { ShotEntry } from '../components/ShotEntry'
import { ShotExtras } from '../components/ShotExtras'
import { StepperRow } from '../components/StepperRow'
import { SuggestionCard } from '../components/SuggestionCard'
import { GRIND_MAX, GRIND_MIN } from '../domain/constants'
import { formatNumber } from '../domain/format'
import { formatRatio } from '../domain/ratio'
import { TASTE_LABELS } from '../domain/schemas'
import type { Shot } from '../domain/schemas'
import { draftFromPrefill } from '../domain/shotDraft'
import { activeBeans, defaultBeanId, lastShotForBean, prefillForBean } from '../domain/shots'
import { suggestNextStep } from '../domain/suggest'
import type { Suggestion } from '../domain/suggest'
import { useBackupReminder } from '../hooks/useBackupReminder'
import { useData } from '../hooks/DataContext'
import { useElementHeight } from '../hooks/useElementHeight'
import { navigate } from '../hooks/useHashRoute'
import { useKeyboardInset } from '../hooks/useKeyboardInset'
import { useShotForm } from '../hooks/useShotForm'
import { newId } from '../lib/files'
import { BeanEditor } from './BeanEditor'

function parse(value: string): number {
  return Number(value.replace(',', '.'))
}

function describeShot(shot: Shot): string {
  return `${formatNumber(shot.doseInG)}g → ${formatNumber(shot.yieldOutG)}g in ${formatNumber(shot.timeSec)}s at ${shot.grindSetting}, ${TASTE_LABELS[shot.taste].toLowerCase()}`
}

export function LogScreen() {
  const { beans, saveShot, settings, shots } = useData()
  const beanOptions = activeBeans(beans)
  const [initial] = useState(() => {
    const beanId = defaultBeanId(beans, shots)
    return { beanId, prefill: prefillForBean(beanId, shots) }
  })
  const form = useShotForm(() => draftFromPrefill(initial.beanId, initial.prefill))
  const [yieldTarget, setYieldTarget] = useState(initial.prefill.yieldOutG)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [addingBean, setAddingBean] = useState(false)
  const [editingExtras, setEditingExtras] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dockFocused, setDockFocused] = useState(false)
  const [dockRef, dockHeight] = useElementHeight<HTMLElement>()
  const keyboardInset = useKeyboardInset()
  const showBackupReminder = useBackupReminder()
  const { draft, errors } = form

  const selectBean = (beanId: string) => {
    const prefill = prefillForBean(beanId, shots)
    form.update({ beanId, dose: formatNumber(prefill.doseInG), grind: String(prefill.grindSetting) })
    setYieldTarget(prefill.yieldOutG)
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
      setYieldTarget(shot.yieldOutG)
      const focused = document.activeElement
      if (focused && 'blur' in focused && typeof focused.blur === 'function') {
        focused.blur()
      }
    } finally {
      setSaving(false)
    }
  }

  const applySuggestion = (next: Suggestion['next']) => {
    form.update({ dose: formatNumber(next.doseInG), grind: String(next.grindSetting) })
    setYieldTarget(next.yieldOutG)
    setSuggestion(null)
  }

  const dose = parse(draft.dose)
  const yieldOut = parse(draft.yieldOut)
  const ratioText = draft.yieldOut.trim() && dose > 0 && yieldOut > 0 ? formatRatio(dose, yieldOut) : '—'
  const lastShot = lastShotForBean(draft.beanId, shots)
  const grindDecimals = String(settings.grindStep).split('.')[1]?.length ?? 0

  if (beanOptions.length === 0) {
    return (
      <div className="screen">
        <h1 className="visually-hidden">Log a shot</h1>
        <section className="card empty">
          <h2>Add your first bean</h2>
          <p className="muted">Shots are logged against a bean, so start with the one in your hopper.</p>
          <button className="btn btn--primary btn--block btn--large" onClick={() => setAddingBean(true)} type="button">
            Add a bean
          </button>
        </section>
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

  return (
    <>
    <form
      className="screen log"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
      style={{ paddingBottom: dockHeight + 16 }}
    >
      <h1 className="visually-hidden">Log a shot</h1>

      {showBackupReminder ? <BackupBanner onOpen={() => navigate('settings')} /> : null}

      <BeanSelect
        beans={beanOptions}
        error={errors.beanId}
        onAddBean={() => setAddingBean(true)}
        onChange={selectBean}
        value={draft.beanId}
      />

      {lastShot ? (
        <p className="log__context">
          {suggestion ? 'Saved just now' : 'Last with this bean'}: {describeShot(lastShot)}
        </p>
      ) : null}

      <section aria-labelledby="before-shot" className="log__recipe">
        <h2 className="section-label" id="before-shot">
          Before the shot
        </h2>
        <StepperRow
          decimals={1}
          error={errors.dose}
          hint="grams"
          id="log-dose"
          label="Dose in"
          max={40}
          min={0}
          onChange={(value) => form.update({ dose: value })}
          step={0.5}
          value={draft.dose}
        />
        <StepperRow
          decimals={grindDecimals}
          error={errors.grind}
          hint={`Niche · ${GRIND_MIN}–${GRIND_MAX}`}
          id="log-grind"
          label="Grind"
          max={GRIND_MAX}
          min={GRIND_MIN}
          onChange={(value) => form.update({ grind: value })}
          step={settings.grindStep}
          value={draft.grind}
        />
      </section>

      <Dock
        bottom={dockFocused && keyboardInset > 0 ? keyboardInset : null}
        label={suggestion ? 'Suggestion for your next shot' : 'Shot result'}
        onFocusChange={setDockFocused}
        ref={dockRef}
      >
        {suggestion ? (
          <SuggestionCard
            onApply={() => applySuggestion(suggestion.next)}
            onDismiss={() => setSuggestion(null)}
            suggestion={suggestion}
          />
        ) : (
          <ShotEntry
            errors={errors}
            hasExtras={draft.rating != null || draft.notes.trim() !== ''}
            onOpenExtras={() => setEditingExtras(true)}
            onTasteChange={(taste) => form.update({ taste })}
            onTimeChange={(time) => form.update({ time })}
            onYieldChange={(value) => form.update({ yieldOut: value })}
            ratioText={ratioText}
            saving={saving}
            taste={draft.taste}
            time={draft.time}
            yieldHint={`${formatNumber(yieldTarget)}g`}
            yieldOut={draft.yieldOut}
          />
        )}
      </Dock>
    </form>

      <Sheet onClose={() => setEditingExtras(false)} open={editingExtras} title="Rating and notes">
        <ShotExtras
          notes={draft.notes}
          onDone={() => setEditingExtras(false)}
          onNotesChange={(notes) => form.update({ notes })}
          onRatingChange={(rating) => form.update({ rating })}
          rating={draft.rating}
        />
      </Sheet>

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
    </>
  )
}
