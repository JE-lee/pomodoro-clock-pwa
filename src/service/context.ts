import { createContext, useEffect, useReducer, useState } from 'react'
import type { DataOfDay, HeatMapItem, IClockContext, IHeatMapContext } from '../type'
import { formatHumanReadableDate, getDateRaw } from '../shared'
import { getThreadDataOfLastYear } from './db'

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

function clockSettingReducer(state: IClockContext, action: { type: string; payload: Partial<IClockContext> }): IClockContext {
  if (action.type === 'update') {
    if (action.payload.sessionTime)
      action.payload.sessionTime = Number(action.payload.sessionTime) || defaultClockContext.sessionTime
    if (action.payload.breakTime)
      action.payload.breakTime = Number(action.payload.breakTime) || defaultClockContext.breakTime

    return {
      ...state,
      ...action.payload,
    }
  }
  return state
}

const clockContextStoraged = getClockContext()

export function useClockSetting() {
  const [clockSetting, dispatch] = useReducer(clockSettingReducer, clockContextStoraged)

  // save clock context to localStorage
  useEffect(() => {
    saveClockContext(clockSetting)
  }, [clockSetting])

  const updateClockSetting = (payload: Partial<IClockContext>) => {
    dispatch({ type: 'update', payload })
  }

  return {
    clockSetting,
    updateClockSetting,
  }
}

// heatmap data context
export const HeatMapContext = createContext<IHeatMapContext>({
  heatMapData: [],
  refresh: () => {},
})

export function useHeatMap() {
  const [heatMapData, setHeatMapdata] = useState<HeatMapItem[]>([])

  const refresh = () => {
    getThreadDataOfLastYear().then((threads) => {
      setHeatMapdata(initializeHeatMapData(Date.now() - 365 * 24 * 60 * 60 * 1000, Date.now(), threads))
    })
  }
  // load data from indexedDB when visit page
  useEffect(() => refresh(), [])

  return { heatMapData, refresh }
}

function initializeHeatMapData(from: number, to: number, originData: DataOfDay[] = []): HeatMapItem[] {
  const startDate = new Date(from)
  const endDate = new Date(to)
  if (!startDate || !endDate || startDate > endDate)
    return []

  const originDataMap: Record<string, DataOfDay> = {}
  originData.forEach(item => originDataMap[item.date] = item)

  const heatMapData: HeatMapItem[] = []
  let start = from
  const end = to

  while (start <= end) {
    const date = new Date(start)
    const dateStr = getDateRaw(date)
    const dataOfDay = originDataMap[dateStr]
    heatMapData.push({
      date: dateStr,
      value: dataOfDay?.sessions ?? 0,
      tooltip: `Sessions: ${dataOfDay?.sessions ?? 0}, Breaks: ${dataOfDay?.breaks ?? 0} on ${formatHumanReadableDate(date)}`,
    })

    start += 24 * 60 * 60 * 1000
  }

  return heatMapData
}
