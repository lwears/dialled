import { useRef, useState } from 'react'
import { askClaude } from '../ai/claude'
import { buildCoachRequest, normaliseNext } from '../domain/coach'
import type { CoachAdvice } from '../domain/coach'
import type { Bean, Shot } from '../domain/schemas'
import { suggestNextStep } from '../domain/suggest'
import { useData } from './DataContext'

export type CoachState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { advice: CoachAdvice; kind: 'done' }
  | { error: string; kind: 'error' }

const answered = new Map<string, CoachAdvice>()

export function useCoach(shot: Shot, bean: Bean) {
  const { settings, shots } = useData()
  const apiKey = settings.anthropicApiKey
  const cached = answered.get(shot.id)
  const [state, setState] = useState<CoachState>(cached ? { advice: cached, kind: 'done' } : { kind: 'idle' })
  const controller = useRef<AbortController | null>(null)

  const ask = async () => {
    if (!apiKey) {
      return
    }
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setState({ kind: 'loading' })
    const { grindStep } = settings
    const rule = suggestNextStep(shot, shots, bean, { grindStep })
    const result = await askClaude(apiKey, buildCoachRequest(shot, shots, bean, rule, grindStep), current.signal)
    if (current.signal.aborted) {
      return
    }
    if (result.ok) {
      const advice = { ...result.advice, next: normaliseNext(result.advice.next, grindStep) }
      answered.set(shot.id, advice)
      setState({ advice, kind: 'done' })
    } else {
      setState({ error: result.error, kind: 'error' })
    }
  }

  return { ask, available: Boolean(apiKey), state }
}
