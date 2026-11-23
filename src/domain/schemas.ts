import { z } from 'zod'
import { DEFAULT_GRIND_STEP, GRIND_MAX, GRIND_MIN } from './constants'

export const roastLevelSchema = z.enum(['light', 'medium', 'dark'])
export type RoastLevel = z.infer<typeof roastLevelSchema>

export const tasteSchema = z.enum([
  'sour',
  'slightlySour',
  'balanced',
  'slightlyBitter',
  'bitter',
  'bitterAndSour',
  'flat',
])
export type Taste = z.infer<typeof tasteSchema>

export const ratingSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
export type Rating = z.infer<typeof ratingSchema>

const isoDate = z.iso.date()
const isoDateTime = z.iso.datetime({ offset: true })
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))

export const beanSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Give the bean a name'),
  roaster: z.string().trim(),
  roastLevel: roastLevelSchema,
  roastDate: isoDate.optional(),
  notes: optionalText,
  archived: z.boolean(),
})
export type Bean = z.infer<typeof beanSchema>

export const coachAdviceSchema = z.object({
  headline: z.string().describe('One short sentence naming the single change to make, e.g. "Grind one step finer".'),
  reason: z.string().describe('Two or three sentences explaining why, referring to this shot and the trend.'),
  next: z.object({
    doseInG: z.number().describe('Dose for the next shot in grams.'),
    yieldOutG: z.number().describe('Target yield for the next shot in grams.'),
    grindSetting: z.number().describe('Niche Zero setting for the next shot.'),
  }),
  tips: z.array(z.string()).describe('Zero to three short, practical tips. Empty if nothing worth adding.'),
})
export type CoachAdvice = z.infer<typeof coachAdviceSchema>

export const savedCoachAdviceSchema = coachAdviceSchema.extend({
  askedAt: isoDateTime,
  model: z.string(),
})
export type SavedCoachAdvice = z.infer<typeof savedCoachAdviceSchema>

export const shotSchema = z.object({
  id: z.string().min(1),
  createdAt: isoDateTime,
  beanId: z.string().min(1, 'Pick a bean'),
  doseInG: z.number().positive('Dose must be above 0g').max(40),
  yieldOutG: z.number().positive('Yield must be above 0g').max(150),
  timeSec: z.number().min(0).max(300),
  grindSetting: z.number().min(GRIND_MIN).max(GRIND_MAX, `Grind must be ${GRIND_MIN}–${GRIND_MAX}`),
  taste: tasteSchema,
  rating: ratingSchema.optional(),
  notes: optionalText,
  claudeAdvice: savedCoachAdviceSchema.optional(),
})
export type Shot = z.infer<typeof shotSchema>

export const settingsSchema = z.object({
  grindStep: z.number().positive().max(5).default(DEFAULT_GRIND_STEP),
  firstRunAt: isoDateTime,
  lastBackupAt: isoDateTime.optional(),
  anthropicApiKey: z.string().optional(),
})
export type Settings = z.infer<typeof settingsSchema>

export const EXPORT_FORMAT = 'dialled-backup'
export const EXPORT_VERSION = 1

export const exportDataSchema = z.object({
  format: z.literal(EXPORT_FORMAT),
  version: z.literal(EXPORT_VERSION),
  exportedAt: isoDateTime,
  beans: z.array(beanSchema),
  shots: z.array(shotSchema),
  settings: settingsSchema.partial().optional(),
})
export type ExportData = z.infer<typeof exportDataSchema>

export const ROAST_LEVELS = roastLevelSchema.options
export const TASTES = tasteSchema.options

export const TASTE_LABELS = {
  balanced: 'Balanced',
  bitter: 'Bitter',
  bitterAndSour: 'Bitter & sour',
  flat: 'Flat',
  slightlyBitter: 'Slightly bitter',
  slightlySour: 'Slightly sour',
  sour: 'Sour',
} satisfies Record<Taste, string>

export const TASTE_SCALE = ['sour', 'slightlySour', 'balanced', 'slightlyBitter', 'bitter'] as const satisfies ReadonlyArray<Taste>
export const TASTE_OTHER = ['bitterAndSour', 'flat'] as const satisfies ReadonlyArray<Taste>

export const ROAST_LABELS = {
  dark: 'Dark',
  light: 'Light',
  medium: 'Medium',
} satisfies Record<RoastLevel, string>
