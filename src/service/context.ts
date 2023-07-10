import { createContext } from 'react'
import type { IClockContext } from '../type'

export const defaultClockContext: IClockContext = {
  sessionTime: 30,
  breakTime: 2,
  sessionHints: 'It\'s time to work!',
  breakHints: 'It\'s time to take a break!',
  silent: false,
}

export const ClockContext = createContext<IClockContext & { update?: (payload: Partial<IClockContext>) => void }>(defaultClockContext)

const clockCtxKey = 'clock-context'

export function saveClockContext(context: IClockContext) {
  localStorage.setItem(clockCtxKey, JSON.stringify(context))
}

export function getClockContext(): IClockContext {
  const context = localStorage.getItem(clockCtxKey)
  if (context)
    return JSON.parse(context)

  return defaultClockContext
}
