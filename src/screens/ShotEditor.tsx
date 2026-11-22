import { useState } from 'react'
import { CoachPanel } from '../components/CoachPanel'
import { ConfirmButton } from '../components/ConfirmButton'
import { ShotFields } from '../components/ShotFields'
import { PastSuggestion } from '../components/SuggestionCard'
import { fromLocalDateInput, toLocalDateInput } from '../domain/format'
import type { Shot } from '../domain/schemas'
import { draftFromShot } from '../domain/shotDraft'
import { suggestNextStep } from '../domain/suggest'
import { useData } from '../hooks/DataContext'
import { useShotForm } from '../hooks/useShotForm'

export function ShotEditor({ onDone, shot }: { onDone: () => void; shot: Shot }) {
  const { beans, deleteShot, saveShot, settings, shots } = useData()
  const form = useShotForm(() => draftFromShot(shot))
  const [when, setWhen] = useState(() => toLocalDateInput(shot.createdAt))
  const beanOptions = beans.filter((bean) => !bean.archived || bean.id === shot.beanId)
  const bean = beans.find((candidate) => candidate.id === shot.beanId)
  const suggestion = bean ? suggestNextStep(shot, shots, bean, { grindStep: settings.grindStep }) : null

  const save = async () => {
    const createdAt = when ? fromLocalDateInput(when) : shot.createdAt
    const updated = form.validate(shot.id, createdAt)
    if (updated) {
      await saveShot(updated)
      onDone()
    }
  }

  return (
    <form
      className="stack"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      {suggestion ? <PastSuggestion suggestion={suggestion} /> : null}
      {bean ? <CoachPanel autoAsk={false} bean={bean} onApply={null} shot={shot} /> : null}
      <div className="field">
        <label className="field__label" htmlFor="edit-when">
          Pulled at
        </label>
        <input
          className="input"
          id="edit-when"
          onChange={(event) => setWhen(event.target.value)}
          type="datetime-local"
          value={when}
        />
      </div>
      <ShotFields
        beans={beanOptions}
        draft={form.draft}
        errors={form.errors}
        grindStep={settings.grindStep}
        idPrefix="edit"
        onChange={form.update}
      />
      <div className="actions">
        <button className="btn btn--primary btn--block" type="submit">
          Save changes
        </button>
        <ConfirmButton
          confirmLabel="Tap again to delete"
          label="Delete shot"
          onConfirm={() => {
            void deleteShot(shot.id).then(onDone)
          }}
        />
      </div>
    </form>
  )
}
