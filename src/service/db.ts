import Dexie from 'dexie'
import type { IThread } from '../type'

class ThreadDatabase extends Dexie {
  threads: Dexie.Table<IThread, number>

  constructor() {
    super('ThreadDatabase')
    this.version(2).stores({
      threads: '++id, uid, type, startTimestamp, endTimeStamp, expectedTime',
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
