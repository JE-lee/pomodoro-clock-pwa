import Dexie from 'dexie'
import { ThreadType } from '../type'
import type { DataOfDay, IThread } from '../type'
import { getDateRaw } from '../shared'

class ThreadDatabase extends Dexie {
  threads: Dexie.Table<IThread, number>

  constructor() {
    super('ThreadDatabase')
    this.version(3).stores({
      threads: '++id, startTimestamp',
    })
    this.threads = this.table('threads')
  }
}

export function getThreadDb() {
  return new ThreadDatabase()
}

export function addThread(thread: IThread) {
  thread.uid = thread.uid ?? '0'
  const db = getThreadDb()
  return db.threads.add(thread)
}

export function clearThread() {
  const db = getThreadDb()
  return db.threads.clear()
}

export async function getThreadDataOfLastYear(): Promise<DataOfDay[]> {
  const db = getThreadDb()
  // 查询近一年的数据
  const threads = await db.threads.where('startTimestamp').above(Date.now() - 365 * 24 * 60 * 60 * 1000).sortBy('startTimestamp')
  const heatMapData: Record<string, DataOfDay> = {}
  threads.forEach((thread) => {
    const date = getDateRaw(thread.startTimestamp)
    heatMapData[date] = heatMapData[date] ?? {
      sessions: 0,
      breaks: 0,
      date,
    }
    heatMapData[date].sessions += thread.type === ThreadType.SESSION ? 1 : 0
    heatMapData[date].breaks += thread.type === ThreadType.BREAK ? 1 : 0
  })

  return Object.values(heatMapData)
}
