import { useSyncExternalStore } from 'react'

export const ROUTES = ['log', 'history', 'beans', 'settings'] as const
export type Route = (typeof ROUTES)[number]

function isRoute(value: string): value is Route {
  return ROUTES.some((route) => route === value)
}

function readRoute(): Route {
  const value = window.location.hash.replace(/^#\/?/, '')
  return isRoute(value) ? value : 'log'
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function navigate(route: Route) {
  window.location.hash = `/${route}`
}

export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, readRoute)
}
