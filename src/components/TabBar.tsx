import type { Route } from '../hooks/useHashRoute'

const ICONS = {
  beans: <path d="M12 3c4 0 7 3.6 7 9s-3 9-7 9-7-3.6-7-9 3-9 7-9Zm0 0c-2 3-2 6 0 9s2 6 0 9" />,
  history: <path d="M4 6h16M4 12h16M4 18h10" />,
  log: (
    <>
      <path d="M5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V9Z" />
      <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M11 3v3M14 3v3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
} satisfies Record<Route, React.ReactNode>

const TABS = [
  { label: 'Log', route: 'log' },
  { label: 'History', route: 'history' },
  { label: 'Beans', route: 'beans' },
  { label: 'Settings', route: 'settings' },
] as const satisfies ReadonlyArray<{ label: string; route: Route }>

export function TabBar({
  current,
  onNavigate,
  settingsBadge,
}: {
  current: Route
  onNavigate: (route: Route) => void
  settingsBadge: boolean
}) {
  return (
    <nav aria-label="Main" className="tabbar">
      {TABS.map((tab) => (
        <button
          aria-current={current === tab.route ? 'page' : undefined}
          className="tabbar__tab"
          key={tab.route}
          onClick={() => onNavigate(tab.route)}
          type="button"
        >
          <span aria-hidden="true" className="tabbar__icon">
            <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="24">
              {ICONS[tab.route]}
            </svg>
            {tab.route === 'settings' && settingsBadge ? <span className="tabbar__badge" /> : null}
          </span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
