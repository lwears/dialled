import { DEFAULT_DOSE_G, DEFAULT_GRIND, DEFAULT_YIELD_G } from './constants'
import type { Bean, Shot } from './schemas'

export interface ShotPrefill {
  doseInG: number
  yieldOutG: number
  grindSetting: number
}

export function sortNewestFirst(shots: ReadonlyArray<Shot>): Array<Shot> {
  return shots.toSorted((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export function prefillForBean(beanId: string | undefined, shots: ReadonlyArray<Shot>): ShotPrefill {
  const newest = sortNewestFirst(shots)
  const last = newest.find((shot) => shot.beanId === beanId)
  if (last) {
    return { doseInG: last.doseInG, grindSetting: last.grindSetting, yieldOutG: last.yieldOutG }
  }
  return {
    doseInG: DEFAULT_DOSE_G,
    grindSetting: newest.at(0)?.grindSetting ?? DEFAULT_GRIND,
    yieldOutG: DEFAULT_YIELD_G,
  }
}

export interface BeanShotGroup {
  bean: Bean | undefined
  beanId: string
  shots: Array<Shot>
}

export function groupShotsByBean(shots: ReadonlyArray<Shot>, beans: ReadonlyArray<Bean>): Array<BeanShotGroup> {
  const beansById = new Map(beans.map((bean) => [bean.id, bean]))
  const groups = new Map<string, BeanShotGroup>()
  for (const shot of sortNewestFirst(shots)) {
    const group = groups.get(shot.beanId) ?? { bean: beansById.get(shot.beanId), beanId: shot.beanId, shots: [] }
    group.shots.push(shot)
    groups.set(shot.beanId, group)
  }
  return [...groups.values()]
}

export function activeBeans(beans: ReadonlyArray<Bean>): Array<Bean> {
  return beans.filter((bean) => !bean.archived).toSorted((a, b) => a.name.localeCompare(b.name, 'en-GB'))
}

export function defaultBeanId(beans: ReadonlyArray<Bean>, shots: ReadonlyArray<Shot>): string {
  const active = activeBeans(beans)
  const lastBeanId = sortNewestFirst(shots).at(0)?.beanId
  return active.find((bean) => bean.id === lastBeanId)?.id ?? active.at(0)?.id ?? ''
}

export function lastShotForBean(beanId: string, shots: ReadonlyArray<Shot>): Shot | undefined {
  return sortNewestFirst(shots).find((shot) => shot.beanId === beanId)
}
