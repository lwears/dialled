import { COACH_SYSTEM_PROMPT } from '../domain/coach'
import { coachAdviceSchema } from '../domain/schemas'
import type { CoachAdvice } from '../domain/schemas'

export const CLAUDE_MODEL = 'claude-sonnet-5-5'

export type CoachResult = { advice: CoachAdvice; ok: true } | { error: string; ok: false }

function describeError(error: unknown): string {
  const status = typeof error === 'object' && error && 'status' in error ? error.status : undefined
  if (status === 401 || status === 403) {
    return 'Claude didn’t accept your API key. Check it in Settings.'
  }
  if (status === 402 || status === 400) {
    const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : ''
    if (/credit|billing|balance/i.test(message)) {
      return 'Your Claude API account is out of credit. Top it up in the Claude Console.'
    }
    return `Claude couldn’t handle that request: ${message}`
  }
  if (status === 429) {
    return 'Too many requests. Wait a moment and try again.'
  }
  if (typeof status === 'number' && status >= 500) {
    return 'Claude is busy right now. Try again in a minute.'
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'You’re offline. The rule-based suggestion still works.'
  }
  return 'Couldn’t reach Claude. Check your connection and try again.'
}

export async function askClaude(apiKey: string, request: string, signal?: AbortSignal): Promise<CoachResult> {
  const [{ default: Anthropic }, { betaZodOutputFormat }] = await Promise.all([
    import('@anthropic-ai/sdk'),
    import('@anthropic-ai/sdk/helpers/beta/zod'),
  ])
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 })

  try {
    const response = await client.beta.messages.parse(
      {
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        max_tokens: 16_000,
        messages: [{ content: request, role: 'user' }],
        model: CLAUDE_MODEL,
        output_config: { effort: 'medium', format: betaZodOutputFormat(coachAdviceSchema) },
        system: COACH_SYSTEM_PROMPT,
      },
      { signal },
    )
    if (response.stop_reason === 'refusal') {
      return { error: 'Claude declined to answer that one. The rule-based suggestion still stands.', ok: false }
    }
    if (!response.parsed_output) {
      return { error: 'Claude’s answer came back incomplete. Try again.', ok: false }
    }
    return { advice: response.parsed_output, ok: true }
  } catch (error) {
    return { error: describeError(error), ok: false }
  }
}
