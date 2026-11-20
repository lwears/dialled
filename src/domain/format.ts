const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
})

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatSeconds(totalSec: number): string {
  return `${totalSec.toFixed(1)}s`
}

export function toLocalDateInput(iso: string): string {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function fromLocalDateInput(value: string): string {
  return new Date(value).toISOString()
}
