import { Dexie } from 'dexie'
import type { EntityTable } from 'dexie'
import { DEFAULT_GRIND_STEP } from '../domain/constants'
import { settingsSchema } from '../domain/schemas'
import type { Bean, Settings, Shot } from '../domain/schemas'
import type { Repository } from './repository'

interface SettingsRow extends Settings {
  key: 'settings'
}

class DialledDatabase extends Dexie {
  beans!: EntityTable<Bean, 'id'>
  shots!: EntityTable<Shot, 'id'>
  settings!: EntityTable<SettingsRow, 'key'>

  constructor() {
    super('dialled')
    this.version(1).stores({
      beans: 'id, name, archived',
      settings: 'key',
      shots: 'id, beanId, createdAt',
    })
  }
}

function defaultSettings(): Settings {
  return { firstRunAt: new Date().toISOString(), grindStep: DEFAULT_GRIND_STEP }
}

export function createDexieRepository(): Repository {
  const db = new DialledDatabase()

  const loadSettings = async (): Promise<Settings> => {
    const row = await db.settings.get('settings')
    const parsed = settingsSchema.safeParse(row)
    if (parsed.success) {
      return parsed.data
    }
    const settings = defaultSettings()
    await db.settings.put({ ...settings, key: 'settings' })
    return settings
  }

  return {
    async deleteShot(id) {
      await db.shots.delete(id)
    },
    async importData(data) {
      await db.transaction('rw', db.beans, db.shots, db.settings, async () => {
        await db.beans.bulkPut(data.beans)
        await db.shots.bulkPut(data.shots)
        if (data.settings?.grindStep != null) {
          const current = await loadSettings()
          await db.settings.put({ ...current, grindStep: data.settings.grindStep, key: 'settings' })
        }
      })
    },
    async load() {
      const [beans, shots, settings] = await Promise.all([db.beans.toArray(), db.shots.toArray(), loadSettings()])
      return { beans, settings, shots }
    },
    async saveBean(bean) {
      await db.beans.put(bean)
    },
    async saveSettings(settings) {
      await db.settings.put({ ...settings, key: 'settings' })
    },
    async saveShot(shot) {
      await db.shots.put(shot)
    },
  }
}
