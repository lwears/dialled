export interface Point {
  x: number
  y: number
}

export interface Series {
  points: Array<Point>
  min: number
  max: number
}

export interface SeriesFrame {
  width: number
  height: number
  padding: number
  include?: ReadonlyArray<number>
}

export function toSeries(values: ReadonlyArray<number>, frame: SeriesFrame): Series {
  const { height, include = [], padding, width } = frame
  if (values.length === 0) {
    return { max: 0, min: 0, points: [] }
  }
  const min = Math.min(...values, ...include)
  const max = Math.max(...values, ...include)
  const span = max - min || 1
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const points = values.map((value, index) => ({
    x: padding + index * stepX,
    y: max === min ? height / 2 : padding + (1 - (value - min) / span) * (height - padding * 2),
  }))
  return { max, min, points }
}

export function yForValue(value: number, series: Series, frame: SeriesFrame): number {
  const span = series.max - series.min || 1
  return frame.padding + (1 - (value - series.min) / span) * (frame.height - frame.padding * 2)
}
