import { z } from 'zod'
import { formatNumber } from './format'
import { shotSchema } from './schemas'
import type { Rating, Shot, Taste } from './schemas'
import type { ShotPrefill } from './shots'

export interface ShotDraft {
  beanId: string
  dose: string
  yieldOut: string
  time: string
  grind: string
  taste: Taste | undefined
  rating: Rating | undefined
  notes: string
}

export type DraftField = 'beanId' | 'dose' | 'yieldOut' | 'time' | 'grind' | 'taste'

export type DraftErrors = Partial<Record<DraftField, string>>

const numeric = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${label}`)
    .transform((value) => Number(value.replace(',', '.')))
    .pipe(z.number({ error: `${label[0]?.toUpperCase()}${label.slice(1)} must be a number` }))

const draftSchema = z.object({
  beanId: z.string().min(1, 'Pick a bean'),
  dose: numeric('dose'),
  grind: numeric('grind setting'),
  notes: z.string(),
  rating: shotSchema.shape.rating,
  taste: z.enum(shotSchema.shape.taste.options, { error: 'How did it taste?' }),
  time: numeric('shot time'),
  yieldOut: numeric('yield'),
})

export function draftFromPrefill(beanId: string, prefill: ShotPrefill): ShotDraft {
  return {
    beanId,
    dose: formatNumber(prefill.doseInG),
    grind: String(prefill.grindSetting),
    notes: '',
    rating: undefined,
    taste: undefined,
    time: '',
    yieldOut: '',
  }
}

export function draftFromShot(shot: Shot): ShotDraft {
  return {
    beanId: shot.beanId,
    dose: String(shot.doseInG),
    grind: String(shot.grindSetting),
    notes: shot.notes ?? '',
    rating: shot.rating,
    taste: shot.taste,
    time: String(shot.timeSec),
    yieldOut: String(shot.yieldOutG),
  }
}

const FIELD_MAP = {
  beanId: 'beanId',
  doseInG: 'dose',
  grindSetting: 'grind',
  taste: 'taste',
  timeSec: 'time',
  yieldOutG: 'yieldOut',
} satisfies Partial<Record<keyof Shot, DraftField>>

function isMappedKey(key: PropertyKey | undefined): key is keyof typeof FIELD_MAP {
  return typeof key === 'string' && Object.hasOwn(FIELD_MAP, key)
}

function isDraftField(key: PropertyKey | undefined): key is DraftField {
  return typeof key === 'string' && Object.values(FIELD_MAP).some((field) => field === key)
}

function collectErrors(issues: ReadonlyArray<z.core.$ZodIssue>, toField: (key: PropertyKey | undefined) => DraftField | undefined) {
  const errors: DraftErrors = {}
  for (const issue of issues) {
    const field = toField(issue.path[0])
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
  }
  return errors
}

export type DraftResult = { ok: true; shot: Shot } | { errors: DraftErrors; ok: false }

export function shotFromDraft(draft: ShotDraft, id: string, createdAt: string): DraftResult {
  const parsed = draftSchema.safeParse(draft)
  if (!parsed.success) {
    return { errors: collectErrors(parsed.error.issues, (key) => (isDraftField(key) ? key : undefined)), ok: false }
  }
  const { beanId, dose, grind, notes, rating, taste, time, yieldOut } = parsed.data
  const result = shotSchema.safeParse({
    beanId,
    createdAt,
    doseInG: dose,
    grindSetting: grind,
    id,
    notes,
    rating,
    taste,
    timeSec: time,
    yieldOutG: yieldOut,
  })
  if (!result.success) {
    return { errors: collectErrors(result.error.issues, (key) => (isMappedKey(key) ? FIELD_MAP[key] : undefined)), ok: false }
  }
  return { ok: true, shot: result.data }
}
