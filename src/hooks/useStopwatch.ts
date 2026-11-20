import { useCallback, useEffect, useRef, useState } from 'react'

export interface Stopwatch {
  running: boolean
  elapsedMs: number
  toggle: () => number | null
  reset: () => void
}

export function useStopwatch(): Stopwatch {
  const [running, setRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startedAt = useRef(0)

  useEffect(() => {
    if (!running) {
      return
    }
    let frame = 0
    const tick = () => {
      setElapsedMs(performance.now() - startedAt.current)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running])

  const toggle = useCallback(() => {
    if (running) {
      const total = performance.now() - startedAt.current
      setElapsedMs(total)
      setRunning(false)
      return total
    }
    startedAt.current = performance.now()
    setElapsedMs(0)
    setRunning(true)
    return null
  }, [running])

  const reset = useCallback(() => {
    setRunning(false)
    setElapsedMs(0)
  }, [])

  return { elapsedMs, reset, running, toggle }
}
