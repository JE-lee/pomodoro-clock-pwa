import { type FC } from 'react'
import type { HeatMapData, HeatMapItem } from '../../type'
import Tooltip from '../Tooltip'

interface HeatMapProps {
  className?: string
  data: HeatMapItem[]
}

const colors = [
  'bg-[#FFFFFF]',
  'bg-[#FED7DC]',
  'bg-[#FDB0C0]',
  'bg-[#FC507D]',
]

// months short name array
const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const monthWidth: Record<string, string> = {
  4: 'w-4',
  8: 'w-8',
  12: 'w-12',
  16: 'w-16',
  20: 'w-20',
  24: 'w-24',
  28: 'w-28',
}

const steps = [1, 5, 9, 14]

function getStepIndex(diff: number) {
  let stepIndex = 0
  for (let i = 0; i < steps.length; i++) {
    if (diff > steps[i])
      stepIndex += 1
  }
  return Math.max(Math.min(steps.length - 1, stepIndex), 0)
}

const HeatMap: FC<HeatMapProps> = (props) => {
  const heatMapData = formateHeatMapData(props.data)

  // heatmap dots
  const dots = heatMapData.map((row, rIndex) => {
    const rDots: React.ReactNode[] = []
    for (let i = 0; i < row.length; i++) {
      const { value, tooltip } = row[i] || {}
      const tooltipContent = <span className="break-keep whitespace-nowrap">{tooltip}</span>
      rDots.push(<Tooltip key={i}
        className={`w-3 h-3 flex-shrink-0 mr-1 mt-1 rounded-sm border border-solid border-gray-200 ${colors[getStepIndex(value)]} ${!row[i] && 'invisible'}`}
        tooltip={tooltipContent}>
      </Tooltip>)
    }

    return (
      <div key={rIndex} className="flex items-center flex-nowrap">{rDots}</div>
    )
  })

  // month indicator
  const monthIndicator: React.ReactNode[] = []
  let monthIndex = -1
  for (let i = 0; i < heatMapData[0]?.length; i++) {
    const month = new Date(getFirstValidDate(heatMapData, i)).getMonth()
    if (monthIndex !== month) {
      monthIndex = month
      // 计算当前月的跨度
      let nextMonth = month
      let count = 0
      while (nextMonth === month && i < heatMapData[0]?.length) {
        i++
        count++
        nextMonth = new Date(getFirstValidDate(heatMapData, i)).getMonth()
      }
      i--
      const w = count * 4
      monthIndicator.push(<div key={i} className={`${monthWidth[w]}`}>{months[month]}</div>)
    }
  }

  return (
    <div className={`${props.className} text-sm`}>
      <div className="flex">
        <div className="mr-2 leading-3 text-gray-500">
          <div className="mt-8">Mon</div>
          <div className="mt-5">Wed</div>
          <div className="mt-5">Fri</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center leading-3">{monthIndicator}</div>
          <div className="text-xs">{dots}</div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-2 text-gray-500">
        <span>Less</span>
        {
          colors.map((color, index) => {
            return <div key={index} className={`w-3 h-3 ml-1 rounded-sm border border-solid border-gray-200 ${color}`}></div>
          })
        }
        <span className="ml-2">More</span>
      </div>
    </div>
  )
}

function formateHeatMapData(datas: HeatMapItem[]): HeatMapData {
  const heatMapData: HeatMapData = []
  let week = 0
  datas.forEach((data) => {
    const date = new Date(data.date)
    const dayInWeek = date.getDay()
    heatMapData[dayInWeek] = heatMapData[dayInWeek] ?? []
    heatMapData[dayInWeek][week] = data
    if (dayInWeek === 6)
      week += 1
  })

  return heatMapData
}

function getFirstValidDate(data: HeatMapData, index: number): string {
  for (let i = 0; i < data.length; i++) {
    if (data[i][index]?.date)
      return data[i][index]?.date
  }
  return ''
}

export default HeatMap
