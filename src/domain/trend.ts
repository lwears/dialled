export interface Point {
  x: number
  y: number
}

export interface Series {
  points: Array<Point>
  min: number
  max: number
}

export function toSeries(values: ReadonlyArray<number>, width: number, height: number, padding = 4): Series {
  if (values.length === 0) {
    return { max: 0, min: 0, points: [] }
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const points = values.map((value, index) => ({
    x: padding + index * stepX,
    y: max === min ? height / 2 : padding + (1 - (value - min) / span) * (height - padding * 2),
  }))
  return { max, min, points }
}
