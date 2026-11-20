import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  const viewport = window.visualViewport
  if (!viewport) {
    return () => {}
  }
  viewport.addEventListener('resize', onChange)
  viewport.addEventListener('scroll', onChange)
  return () => {
    viewport.removeEventListener('resize', onChange)
    viewport.removeEventListener('scroll', onChange)
  }
}

function getInset(): number {
  const viewport = window.visualViewport
  if (!viewport) {
    return 0
  }
  return Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop))
}

export function useKeyboardInset(): number {
  return useSyncExternalStore(subscribe, getInset, () => 0)
}
