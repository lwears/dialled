import { useState } from 'react'
import { formatNumber } from '../domain/format'
import { toSeries, yForValue } from '../domain/trend'

const WIDTH = 280
const HEIGHT = 56
const PADDING = 6

export function Sparkline({
  band,
  labels,
  title,
  unit = '',
  values,
}: {
  band?: { from: number; to: number }
  labels: ReadonlyArray<string>
  title: string
  unit?: string
  values: ReadonlyArray<number>
}) {
  const [active, setActive] = useState<number | null>(null)
  const frame = { height: HEIGHT, include: band ? [band.from, band.to] : [], padding: PADDING, width: WIDTH }
  const series = toSeries(values, frame)
  const { points } = series
  const yFor = (value: number) => yForValue(value, series, frame)
  const shown = active ?? values.length - 1
  const shownValue = values[shown]
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')

  const pick = (clientX: number, rect: DOMRect) => {
    const x = ((clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    for (const [index, point] of points.entries()) {
      if (Math.abs(point.x - x) < Math.abs((points[nearest]?.x ?? 0) - x)) {
        nearest = index
      }
    }
    setActive(nearest)
  }

  if (values.length < 2) {
    return null
  }

  return (
    <figure className="sparkline">
      <figcaption className="sparkline__caption">
        <span>{title}</span>
        <span className="sparkline__value">
          {shownValue == null ? '' : `${formatNumber(shownValue)}${unit}`}
          <span className="sparkline__when"> {labels[shown]}</span>
        </span>
      </figcaption>
      <div className="sparkline__plot">
      <svg
        aria-label={`${title}, oldest to newest: ${values.map((value) => `${formatNumber(value)}${unit}`).join(', ')}`}
        className="sparkline__svg"
        onPointerDown={(event) => pick(event.clientX, event.currentTarget.getBoundingClientRect())}
        onPointerLeave={() => setActive(null)}
        onPointerMove={(event) => pick(event.clientX, event.currentTarget.getBoundingClientRect())}
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        {band ? (
          <rect
            className="sparkline__band"
            height={Math.max(0, yFor(band.from) - yFor(band.to))}
            width={WIDTH}
            x={0}
            y={yFor(band.to)}
          />
        ) : null}
        <path className="sparkline__line" d={path} vectorEffect="non-scaling-stroke" />
        {points[shown] ? (
          <line
            className="sparkline__cursor"
            vectorEffect="non-scaling-stroke"
            x1={points[shown].x}
            x2={points[shown].x}
            y1={0}
            y2={HEIGHT}
          />
        ) : null}
      </svg>
      <div aria-hidden="true" className="sparkline__marker-layer">
        {points[shown] ? (
          <span
            className="sparkline__marker"
            style={{ left: `${(points[shown].x / WIDTH) * 100}%`, top: `${(points[shown].y / HEIGHT) * 100}%` }}
          />
        ) : null}
      </div>
      </div>
    </figure>
  )
}
