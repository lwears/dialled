import { BACKUP_REMINDER_DAYS } from './constants'
import { EXPORT_FORMAT, EXPORT_VERSION, exportDataSchema } from './schemas'
import type { Bean, ExportData, Settings, Shot } from './schemas'
import { formatRatio } from './ratio'

const DAY_MS = 86_400_000

export function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - Date.parse(iso)) / DAY_MS)
}

export function needsBackupReminder(settings: Settings, hasData: boolean, now: Date): boolean {
  if (!hasData) {
    return false
  }
  return daysSince(settings.lastBackupAt ?? settings.firstRunAt, now) > BACKUP_REMINDER_DAYS
}

export function buildExport(
  beans: ReadonlyArray<Bean>,
  shots: ReadonlyArray<Shot>,
  settings: Settings,
  now: Date,
): ExportData {
  return {
    beans: [...beans],
    exportedAt: now.toISOString(),
    format: EXPORT_FORMAT,
    settings: { grindStep: settings.grindStep },
    shots: [...shots],
    version: EXPORT_VERSION,
  }
}

export type ParseResult = { data: ExportData; ok: true } | { error: string; ok: false }

export function parseExport(text: string): ParseResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { error: "That file isn't valid JSON.", ok: false }
  }
  const result = exportDataSchema.safeParse(json)
  if (!result.success) {
    const issue = result.error.issues.at(0)
    const where = issue?.path.length ? ` (at ${issue.path.join('.')})` : ''
    return { error: `That doesn't look like a Dialled backup${where}: ${issue?.message ?? 'unknown error'}`, ok: false }
  }
  const beanIds = new Set(result.data.beans.map((bean) => bean.id))
  const orphan = result.data.shots.find((shot) => !beanIds.has(shot.beanId))
  if (orphan) {
    return { error: `Shot ${orphan.id} refers to a bean that isn't in the file.`, ok: false }
  }
  return { data: result.data, ok: true }
}

function csvCell(value: string | number | undefined): string {
  if (value == null) {
    return ''
  }
  const text = String(value)
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function shotsToCsv(shots: ReadonlyArray<Shot>, beans: ReadonlyArray<Bean>): string {
  const beansById = new Map(beans.map((bean) => [bean.id, bean]))
  const header = [
    'date',
    'bean',
    'roaster',
    'roast_level',
    'dose_g',
    'yield_g',
    'ratio',
    'time_s',
    'grind',
    'taste',
    'rating',
    'notes',
  ]
  const rows = shots.map((shot) => {
    const bean = beansById.get(shot.beanId)
    return [
      shot.createdAt,
      bean?.name,
      bean?.roaster,
      bean?.roastLevel,
      shot.doseInG,
      shot.yieldOutG,
      formatRatio(shot.doseInG, shot.yieldOutG),
      shot.timeSec,
      shot.grindSetting,
      shot.taste,
      shot.rating,
      shot.notes,
    ]
      .map(csvCell)
      .join(',')
  })
  return [header.join(','), ...rows].join('\r\n')
}
