import { DEFAULT_GRIND_STEP, GRIND_MAX, GRIND_MIN } from './constants'
import { formatRatio, ratioOf, roundTo } from './ratio'
import type { Bean, RoastLevel, Shot, Taste } from './schemas'

export type SuggestionKind =
  | 'noChange'
  | 'checkPuckPrep'
  | 'decreaseDose'
  | 'increaseYield'
  | 'decreaseYield'
  | 'grindFiner'
  | 'grindCoarser'
  | 'raiseTemperature'
  | 'lowerTemperature'

export interface NextShot {
  doseInG: number
  yieldOutG: number
  grindSetting: number
}

export interface Suggestion {
  kind: SuggestionKind
  headline: string
  reason: string
  next: NextShot
  warnings: Array<string>
}

export interface SuggestOptions {
  grindStep: number
}

export const TIME = {
  acceptableMax: 35,
  acceptableMin: 25,
  fast: 20,
  slow: 40,
  stall: 50,
  targetMax: 30,
  targetMin: 25,
} as const

export const RATIO_LIMITS = {
  dark: { max: 2.5, min: 1.5 },
  light: { max: 3, min: 1.8 },
  medium: { max: 2.5, min: 1.5 },
} as const satisfies Record<RoastLevel, { max: number; min: number }>

const LIGHT_LONG_RATIO = 2.5
const RATIO_TOLERANCE = 0.05
const STALE_AFTER_DAYS = 42

const TARGET_TIME = `${TIME.targetMin}–${TIME.targetMax}s`

type Variable = 'dose' | 'ratio' | 'grind'

const VARIABLE_LABELS = {
  dose: 'dose',
  grind: 'grind',
  ratio: 'ratio',
} satisfies Record<Variable, string>

export function previousShotsForBean(shot: Shot, history: ReadonlyArray<Shot>): Array<Shot> {
  const time = Date.parse(shot.createdAt)
  return history
    .filter((other) => other.beanId === shot.beanId && other.id !== shot.id && Date.parse(other.createdAt) < time)
    .toSorted((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export function changedVariables(previous: Shot, current: Shot): Array<Variable> {
  const changed: Array<Variable> = []
  if (Math.abs(previous.doseInG - current.doseInG) >= 0.3) {
    changed.push('dose')
  }
  const ratioDelta = ratioOf(previous.doseInG, previous.yieldOutG) - ratioOf(current.doseInG, current.yieldOutG)
  if (Math.abs(ratioDelta) >= 0.1) {
    changed.push('ratio')
  }
  if (Math.abs(previous.grindSetting - current.grindSetting) > 0.001) {
    changed.push('grind')
  }
  return changed
}

const TASTE_PENALTY = {
  balanced: 0,
  bitter: 1,
  bitterAndSour: 2,
  flat: 1,
  slightlyBitter: 0.5,
  slightlySour: 0.5,
  sour: 1,
} satisfies Record<Taste, number>

function gotWorse(previous: Shot, current: Shot): boolean {
  if (previous.taste === 'sour' && current.taste === 'bitter') {
    return true
  }
  if (previous.rating != null && current.rating != null) {
    return current.rating < previous.rating
  }
  return TASTE_PENALTY[current.taste] > TASTE_PENALTY[previous.taste]
}

function joinList(items: ReadonlyArray<string>): string {
  return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}

function clampGrind(value: number): number {
  return roundTo(Math.min(GRIND_MAX, Math.max(GRIND_MIN, value)), 2)
}

function daysBetween(fromIsoDate: string, toIso: string): number {
  return Math.floor((Date.parse(toIso) - Date.parse(fromIsoDate)) / 86_400_000)
}

function buildWarnings(shot: Shot, previous: Shot | undefined, bean: Bean): Array<string> {
  const warnings: Array<string> = []
  if (previous) {
    const changed = changedVariables(previous, shot)
    if (changed.length > 1) {
      warnings.push(
        `You changed the ${joinList(changed.map((variable) => VARIABLE_LABELS[variable]))} since your last shot with this bean, so it's hard to tell which made the difference. Try changing one thing at a time.`,
      )
    }
  }
  if (bean.roastDate && daysBetween(bean.roastDate, shot.createdAt) > STALE_AFTER_DAYS) {
    warnings.push(
      `These beans were roasted over ${STALE_AFTER_DAYS / 7} weeks ago. Older beans can taste flat whatever you adjust.`,
    )
  }
  return warnings
}

type Decision = Omit<Suggestion, 'warnings'>

function decide(shot: Shot, previous: Shot | undefined, bean: Bean, grindStep: number): Decision {
  const current: NextShot = {
    doseInG: shot.doseInG,
    grindSetting: shot.grindSetting,
    yieldOutG: shot.yieldOutG,
  }
  const ratio = ratioOf(shot.doseInG, shot.yieldOutG)
  const limits = RATIO_LIMITS[bean.roastLevel]
  const time = Math.round(shot.timeSec)
  const yieldStep = Math.max(1, Math.round(shot.doseInG * 0.2))
  const smallYieldStep = Math.max(1, Math.round(shot.doseInG * 0.1))

  const finer = (reason: string): Decision => ({
    headline: 'Grind one step finer',
    kind: 'grindFiner',
    next: { ...current, grindSetting: clampGrind(shot.grindSetting - grindStep) },
    reason,
  })
  const coarser = (reason: string, headline = 'Grind one step coarser'): Decision => ({
    headline,
    kind: 'grindCoarser',
    next: { ...current, grindSetting: clampGrind(shot.grindSetting + grindStep) },
    reason,
  })
  const withYield = (yieldOutG: number) => {
    const rounded = roundTo(yieldOutG, 0)
    return { next: { ...current, yieldOutG: rounded }, ratioText: formatRatio(shot.doseInG, rounded) }
  }
  const hotter = (reason: string): Decision => ({
    headline: 'Try a slightly hotter brew',
    kind: 'raiseTemperature',
    next: current,
    reason: `${reason} With a PID, go up about 2°C; on a stock Gaggia, start the shot just as the boiler finishes a heating cycle.`,
  })
  const cooler = (reason: string): Decision => ({
    headline: 'Try a slightly cooler brew',
    kind: 'lowerTemperature',
    next: current,
    reason: `${reason} With a PID, go down about 2°C; on a stock Gaggia, flush some water through the group head first.`,
  })

  if (shot.taste === 'balanced') {
    const outside = time < TIME.acceptableMin || time > TIME.acceptableMax
    return {
      headline: "Don't change anything",
      kind: 'noChange',
      next: current,
      reason: outside
        ? `It tastes balanced, and taste beats the timer. ${time}s is outside the usual ${TIME.acceptableMin}–${TIME.acceptableMax}s, but that doesn't matter when it tastes right.`
        : 'It tastes balanced, and taste beats the timer. Keep these settings.',
    }
  }

  if (shot.taste === 'bitterAndSour') {
    return {
      headline: 'Check your puck prep',
      kind: 'checkPuckPrep',
      next: current,
      reason:
        "Bitter and sour together usually means channelling: water finds a fast path through the puck, over-extracting some coffee and under-extracting the rest. Break up clumps with WDT, distribute evenly and tamp level, then pull the same recipe again. Don't change the grind yet.",
    }
  }

  if (time >= TIME.stall) {
    return coarser(`The shot stalled at ${time}s. Grind coarser so it flows (aim for ${TARGET_TIME}).`)
  }
  if (time > TIME.slow) {
    return coarser(`At ${time}s the shot ran long (aim for ${TARGET_TIME}). Grind coarser to speed it up.`)
  }
  if (time < TIME.fast) {
    return finer(`At ${time}s the shot ran fast (aim for ${TARGET_TIME}). Grind finer to slow it down.`)
  }

  if (previous && shot.grindSetting < previous.grindSetting && gotWorse(previous, shot)) {
    return coarser(
      `It tasted worse after you ground finer (${previous.grindSetting} → ${shot.grindSetting}), so you've probably passed the sweet spot. Go back one step coarser.`,
      'Go one step coarser',
    )
  }

  if (shot.taste === 'slightlySour') {
    if (ratio < limits.max - RATIO_TOLERANCE) {
      const { next, ratioText } = withYield(Math.min(shot.yieldOutG + smallYieldStep, shot.doseInG * limits.max))
      return {
        headline: `Pull a little longer: ${next.yieldOutG}g out`,
        kind: 'increaseYield',
        next,
        reason: `Only slightly sour, so a small nudge is enough. A couple of grams more (${ratioText}) adds a touch more sweetness.`,
      }
    }
    return finer(
      `Slightly sour at ${formatRatio(shot.doseInG, shot.yieldOutG)}, already a long ratio for a ${bean.roastLevel} roast. One step finer should round it off.`,
    )
  }

  if (shot.taste === 'slightlyBitter') {
    if (ratio > limits.min + RATIO_TOLERANCE) {
      const { next, ratioText } = withYield(Math.max(shot.yieldOutG - smallYieldStep, shot.doseInG * limits.min))
      return {
        headline: `Pull a little shorter: ${next.yieldOutG}g out`,
        kind: 'decreaseYield',
        next,
        reason: `Only slightly bitter, so a small nudge is enough. Stopping a couple of grams earlier (${ratioText}) should take the edge off.`,
      }
    }
    return coarser(
      `Slightly bitter at ${formatRatio(shot.doseInG, shot.yieldOutG)}, already a short ratio. One step coarser should take the edge off.`,
    )
  }

  if (shot.taste === 'sour') {
    if (bean.roastLevel === 'light' && ratio >= LIGHT_LONG_RATIO - RATIO_TOLERANCE) {
      const doseInG = roundTo(shot.doseInG - 1, 1)
      return {
        headline: 'Drop the dose by 1–2g',
        kind: 'decreaseDose',
        next: { ...current, doseInG, yieldOutG: roundTo(doseInG * ratio, 0) },
        reason: `Still sour at ${formatRatio(shot.doseInG, shot.yieldOutG)} on a light roast. A smaller dose at the same ratio extracts more. Try ${doseInG}g in, keeping the ratio.`,
      }
    }
    if (ratio < limits.max - RATIO_TOLERANCE) {
      const { next, ratioText } = withYield(Math.min(shot.yieldOutG + yieldStep, shot.doseInG * limits.max))
      return {
        headline: `Pull a longer shot: ${next.yieldOutG}g out`,
        kind: 'increaseYield',
        next,
        reason: `Sour usually means under-extracted. A longer ratio (${ratioText}) pulls out more sweetness.`,
      }
    }
    if (time >= TIME.acceptableMax) {
      return hotter(
        `Still sour at ${formatRatio(shot.doseInG, shot.yieldOutG)} and the shot is already ${time}s, so ratio and grind are used up.`,
      )
    }
    return finer(
      `Still sour at ${formatRatio(shot.doseInG, shot.yieldOutG)}, already a long ratio for a ${bean.roastLevel} roast. Grind finer to extract more.`,
    )
  }

  if (shot.taste === 'bitter') {
    if (ratio > limits.min + RATIO_TOLERANCE) {
      const { next, ratioText } = withYield(Math.max(shot.yieldOutG - yieldStep, shot.doseInG * limits.min))
      return {
        headline: `Pull a shorter shot: ${next.yieldOutG}g out`,
        kind: 'decreaseYield',
        next,
        reason: `Bitter usually means over-extracted. A shorter ratio (${ratioText}) leaves the harsher compounds behind.`,
      }
    }
    if (time > TIME.targetMin) {
      return coarser(
        `Still bitter at ${formatRatio(shot.doseInG, shot.yieldOutG)}, already a short ratio. Grind coarser to extract less.`,
      )
    }
    return cooler(
      `Still bitter at a short ratio and a quick ${time}s, so ratio and grind are used up. Lower the temperature.`,
    )
  }

  if (ratio > 2.2) {
    const { next, ratioText } = withYield(Math.max(shot.yieldOutG - yieldStep, shot.doseInG * 2))
    return {
      headline: `Pull a shorter shot: ${next.yieldOutG}g out`,
      kind: 'decreaseYield',
      next,
      reason: `Flat often means watery. A shorter ratio (${ratioText}) gives more body and intensity.`,
    }
  }
  if (time < TIME.acceptableMax) {
    return finer('Flat at a normal ratio usually means under-extracted. Grind finer for more flavour.')
  }
  return hotter('Flat even with a long shot time. More heat can bring out more flavour.')
}

export function suggestNextStep(
  shot: Shot,
  history: ReadonlyArray<Shot>,
  bean: Bean,
  options: SuggestOptions = { grindStep: DEFAULT_GRIND_STEP },
): Suggestion {
  const previous = previousShotsForBean(shot, history).at(0)
  return {
    ...decide(shot, previous, bean, options.grindStep),
    warnings: buildWarnings(shot, previous, bean),
  }
}
