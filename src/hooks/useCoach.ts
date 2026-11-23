import { useRef, useState } from 'react'
import { askClaude, CLAUDE_MODEL } from '../ai/claude'
import { buildCoachRequest, normaliseNext } from '../domain/coach'
import type { Bean, SavedCoachAdvice, Shot } from '../domain/schemas'
import { suggestNextStep } from '../domain/suggest'
import { useData } from './DataContext'

export type CoachState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { advice: SavedCoachAdvice; kind: 'done' }
  | { error: string; kind: 'error' }

export function useCoach(shot: Shot, bean: Bean) {
  const { saveShot, settings, shots } = useData()
  const apiKey = settings.anthropicApiKey
  const stored = shots.find((candidate) => candidate.id === shot.id) ?? shot
  const [request, setRequest] = useState<CoachState>({ kind: 'idle' })
  const controller = useRef<AbortController | null>(null)
  const state: CoachState = stored.claudeAdvice ? { advice: stored.claudeAdvice, kind: 'done' } : request

  const ask = async () => {
    if (!apiKey || stored.claudeAdvice) {
      return
    }
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setRequest({ kind: 'loading' })
    const { grindStep } = settings
    const rule = suggestNextStep(stored, shots, bean, { grindStep })
    const result = await askClaude(apiKey, buildCoachRequest(stored, shots, bean, rule, grindStep), current.signal)
    if (current.signal.aborted) {
      return
    }
    if (result.ok) {
      const claudeAdvice: SavedCoachAdvice = {
        ...result.advice,
        askedAt: new Date().toISOString(),
        model: CLAUDE_MODEL,
        next: normaliseNext(result.advice.next, grindStep),
      }
      await saveShot({ ...stored, claudeAdvice })
      setRequest({ kind: 'idle' })
    } else {
      setRequest({ error: result.error, kind: 'error' })
    }
  }

  return { ask, available: Boolean(apiKey), state }
}
