import { GRIND_MAX, GRIND_MIN } from './constants'
import { formatNumber } from './format'
import { formatRatio, roundTo } from './ratio'
import { ROAST_LABELS, TASTE_LABELS } from './schemas'
import type { Bean, Shot } from './schemas'
import { previousShotsForBean, RATIO_LIMITS, TIME } from './suggest'
import type { NextShot, Suggestion } from './suggest'

const HISTORY_LIMIT = 15
const DAY_MS = 86_400_000

export const COACH_SYSTEM_PROMPT = `You are an espresso coach inside Dialled, an app one home barista uses to dial in shots. After each shot they ask you what to change for the next one.

Their equipment:
- Gaggia Classic: single-boiler machine. Assume it is close to stock (about 9 bar, no PID) unless the bean or shot notes say otherwise. Temperature can only be nudged by temperature surfing, so suggest it rarely.
- Niche Zero grinder: stepless dial from ${GRIND_MIN} to ${GRIND_MAX}. A lower number is finer. Their usual step size is given with each request; recommend grind settings on that step.

How to coach:
- Change one variable per shot (grind, dose or yield) so they can tell what made the difference. Grind is usually the first lever; yield is the main lever for taste once time is in range.
- Targets: ${TIME.targetMin}–${TIME.targetMax} seconds is ideal and ${TIME.acceptableMin}–${TIME.acceptableMax} seconds is acceptable. Ratio limits: light roasts 1:${RATIO_LIMITS.light.min}–1:${RATIO_LIMITS.light.max}, medium and dark roasts 1:${RATIO_LIMITS.medium.min}–1:${RATIO_LIMITS.medium.max}.
- Sour usually means under-extracted (grind finer or pull longer), bitter usually means over-extracted (grind coarser or pull shorter). Bitter and sour together, or very fast or stalling shots, often point to channelling and puck prep.
- Use the history for this bean: notice trends, and which changes helped and which made things worse.
- Freshness: they buy large bags (often 1kg), use about 18g a day and keep most of the bag in the freezer. A bean more than about 30 days off roast has spent most of that time frozen, so days since roast says little about staleness. Don't call a bean stale or blame its age on that number alone; only raise freshness if the shots themselves point to it, such as a steady drift towards faster, flatter shots at the same grind.
- A rule-based suggestion is included. Agree with it when it is sound; when you disagree, say why.
- If the shot is already good, say so and keep the recipe.

Write in British English. Be direct and brief, like a friend at the bar, not an essay. Use grams and seconds.`

function describeShot(shot: Shot): string {
  const parts = [
    `${formatNumber(shot.doseInG)}g in`,
    `${formatNumber(shot.yieldOutG)}g out (${formatRatio(shot.doseInG, shot.yieldOutG)})`,
    `${formatNumber(shot.timeSec)}s`,
    `grind ${shot.grindSetting}`,
    `taste: ${TASTE_LABELS[shot.taste].toLowerCase()}`,
  ]
  if (shot.rating) {
    parts.push(`rating ${shot.rating}/5`)
  }
  if (shot.notes) {
    parts.push(`notes: "${shot.notes}"`)
  }
  return parts.join(', ')
}

function describeBean(bean: Bean, now: string): string {
  const lines = [`Bean: ${bean.name}${bean.roaster ? ` from ${bean.roaster}` : ''}`, `Roast: ${ROAST_LABELS[bean.roastLevel].toLowerCase()}`]
  if (bean.roastDate) {
    const days = Math.floor((Date.parse(now) - Date.parse(bean.roastDate)) / DAY_MS)
    lines.push(`Roasted: ${bean.roastDate} (${days} days before this shot)`)
  }
  if (bean.notes) {
    lines.push(`Bean notes: "${bean.notes}"`)
  }
  return lines.join('\n')
}

export function buildCoachRequest(
  shot: Shot,
  history: ReadonlyArray<Shot>,
  bean: Bean,
  ruleSuggestion: Suggestion,
  grindStep: number,
): string {
  const previous = previousShotsForBean(shot, history).slice(0, HISTORY_LIMIT)
  const historyText = previous.length
    ? previous.map((other) => `- ${other.createdAt.slice(0, 16).replace('T', ' ')}: ${describeShot(other)}`).join('\n')
    : '- None yet. This is the first shot with this bean.'
  const rule = ruleSuggestion.next

  return `${describeBean(bean, shot.createdAt)}
Grind step: ${grindStep}

The shot just pulled:
${describeShot(shot)}

Earlier shots with this bean, newest first:
${historyText}

Rule-based suggestion: ${ruleSuggestion.headline} ${ruleSuggestion.reason} Recipe: ${formatNumber(rule.doseInG)}g in, ${formatNumber(rule.yieldOutG)}g out, grind ${rule.grindSetting}.

What should I change for the next shot?`
}

export function normaliseNext(next: NextShot, grindStep: number): NextShot {
  const grind = Math.min(GRIND_MAX, Math.max(GRIND_MIN, Math.round(next.grindSetting / grindStep) * grindStep))
  return {
    doseInG: roundTo(Math.min(40, Math.max(5, next.doseInG)), 1),
    grindSetting: roundTo(grind, 2),
    yieldOutG: roundTo(Math.min(150, Math.max(5, next.yieldOutG)), 0),
  }
}
