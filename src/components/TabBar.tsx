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
  log: <path d="M12 5v14M5 12h14" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
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
