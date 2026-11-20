export function ratioOf(doseInG: number, yieldOutG: number): number {
  return doseInG > 0 ? yieldOutG / doseInG : 0
}

export function formatRatio(doseInG: number, yieldOutG: number): string {
  const ratio = ratioOf(doseInG, yieldOutG)
  return ratio === 0 ? '1:–' : `1:${ratio.toFixed(1)}`
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
