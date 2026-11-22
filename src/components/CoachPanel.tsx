import { useEffect, useRef } from 'react'
import type { NextShot } from '../domain/suggest'
import type { Bean, Shot } from '../domain/schemas'
import { useCoach } from '../hooks/useCoach'
import { SuggestionDetails } from './SuggestionCard'

export function CoachPanel({
  autoAsk,
  bean,
  onApply,
  shot,
}: {
  autoAsk: boolean
  bean: Bean
  onApply: ((next: NextShot) => void) | null
  shot: Shot
}) {
  const { ask, available, state } = useCoach(shot, bean)
  const asked = useRef(false)

  useEffect(() => {
    if (autoAsk && !asked.current && state.kind === 'idle') {
      asked.current = true
      void ask()
    }
  }, [ask, autoAsk, state.kind])

  if (!available) {
    return null
  }

  return (
    <section aria-label="Claude’s take" aria-live="polite" className="suggestion suggestion--past coach">
      <p className="suggestion__eyebrow">Claude’s take</p>
      {state.kind === 'idle' ? (
        <button className="btn btn--outline btn--block" onClick={() => void ask()} type="button">
          Ask Claude about this shot
        </button>
      ) : null}
      {state.kind === 'loading' ? <p className="coach__loading">Asking Claude…</p> : null}
      {state.kind === 'error' ? (
        <>
          <p className="field__error" role="alert">
            {state.error}
          </p>
          <button className="btn btn--outline btn--block" onClick={() => void ask()} type="button">
            Try again
          </button>
        </>
      ) : null}
      {state.kind === 'done' ? (
        <>
          <SuggestionDetails suggestion={{ ...state.advice, warnings: [] }} />
          {state.advice.tips.length ? (
            <ul className="coach__tips">
              {state.advice.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          ) : null}
          {onApply ? (
            <button className="btn btn--primary btn--block" onClick={() => onApply(state.advice.next)} type="button">
              Use Claude’s recipe
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
