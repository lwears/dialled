import { TabBar } from './components/TabBar'
import { useBackupReminder } from './hooks/useBackupReminder'
import { navigate, useHashRoute } from './hooks/useHashRoute'
import { usePersistence } from './hooks/usePersistence'
import { BeansScreen } from './screens/BeansScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { LogScreen } from './screens/LogScreen'
import { SettingsScreen } from './screens/SettingsScreen'

const SCREENS = {
  beans: BeansScreen,
  history: HistoryScreen,
  log: LogScreen,
  settings: SettingsScreen,
} as const

export function App() {
  const route = useHashRoute()
  const backupDue = useBackupReminder()
  usePersistence()
  const Screen = SCREENS[route]

  return (
    <div className="shell">
      <main className="app">
        <div className="app__content">
          <Screen />
        </div>
      </main>
      <TabBar current={route} onNavigate={navigate} settingsBadge={backupDue} />
    </div>
  )
}
