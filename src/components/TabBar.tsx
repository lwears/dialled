import type { ReactNode } from 'react'
import type { Route } from '../hooks/useHashRoute'

const ICONS = {
  beans: (
    <>
      <ellipse cx="12" cy="12" rx="6" ry="8.5" transform="rotate(30 12 12)" />
      <path d="M9 6.5c3 3 0 8 3 11" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  log: (
    <>
      <path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9z" />
      <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8.5 3.5c-.6.8-.6 1.7 0 2.5M12 3.5c-.6.8-.6 1.7 0 2.5" />
    </>
  ),
  settings: (
    <>
      <path d="M5 7h9M18 7h1M5 17h3M12 17h7" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
} satisfies Record<Route, ReactNode>

const TABS = [
  { label: 'Log', route: 'log' },
  { label: 'History', route: 'history' },
  { label: 'Beans', route: 'beans' },
  { label: 'Settings', route: 'settings' },
] as const satisfies ReadonlyArray<{ label: string; route: Route }>

export function TabBar({ current, settingsBadge }: { current: Route; settingsBadge: boolean }) {
  return (
    <nav aria-label="Main" className="tabbar">
      {TABS.map((tab) => {
        const active = current === tab.route
        return (
          <a aria-current={active ? 'page' : undefined} className="tabbar__tab" href={`#/${tab.route}`} key={tab.route}>
            <span aria-hidden="true" className="tabbar__icon">
              <svg
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={active ? 2.1 : 1.8}
                viewBox="0 0 24 24"
                width="24"
              >
                {ICONS[tab.route]}
              </svg>
              {tab.route === 'settings' && settingsBadge ? <span className="tabbar__badge" /> : null}
            </span>
            <span>{tab.label}</span>
            {tab.route === 'settings' && settingsBadge ? <span className="visually-hidden">, backup due</span> : null}
          </a>
        )
      })}
    </nav>
  )
}
