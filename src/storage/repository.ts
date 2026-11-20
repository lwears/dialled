import type { Bean, ExportData, Settings, Shot } from '../domain/schemas'

export interface Snapshot {
  beans: Array<Bean>
  shots: Array<Shot>
  settings: Settings
}

export interface Repository {
  load(): Promise<Snapshot>
  saveBean(bean: Bean): Promise<void>
  saveShot(shot: Shot): Promise<void>
  deleteShot(id: string): Promise<void>
  saveSettings(settings: Settings): Promise<void>
  importData(data: ExportData): Promise<void>
}
