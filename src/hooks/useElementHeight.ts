import { useCallback, useState } from 'react'

export function useElementHeight<T extends HTMLElement>(): [(node: T | null) => void, number] {
  const [height, setHeight] = useState(0)
  const ref = useCallback((node: T | null) => {
    if (!node) {
      return
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setHeight(Math.round(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height))
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, height]
}
