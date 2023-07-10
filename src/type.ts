export enum STATE {
  BEFORE_RUN,
  RUNNING,
  PAUSED,
  BEFORE_BREAK,
  BREAKING,
}

export interface ELementRect {
  x: number
  y: number
  width: number
  height: number
}

export enum ThreadType {
  SESSION,
  BREAK,
}
export interface IThread {
  id?: number
  uid?: string
  type: ThreadType
  startTimestamp: number
  endTimestamp: number
  expectedTime: number
}

export interface IClockContext {
  sessionTime: number
  breakTime: number
  sessionHints: string
  breakHints: string
  silent: boolean
}
