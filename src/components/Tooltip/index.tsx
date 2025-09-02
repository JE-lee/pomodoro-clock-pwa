import type { FC } from 'react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

interface TooltipProps {
  children?: React.ReactNode
  tooltip?: string | React.ReactNode
  className?: string
}

const Tooltip: FC<TooltipProps> = (props) => {
  const [visible, setVisible] = useState(false)
  const tooltipContentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!tooltipContentRef.current)
      return
    // 检查 tooltip content 左右两边是否超出屏幕
    const { left, right } = tooltipContentRef.current.getBoundingClientRect()
    const offset = 4
    if (left < 0)
      tooltipContentRef.current.style.left = `calc(50% + ${-left + offset}px)`

    else if (window.innerWidth - right < 0)
      tooltipContentRef.current.style.left = `calc(50% + ${window.innerWidth - right - offset}px)`
  }, [visible])

  const onMouseEnter = useCallback(() => setVisible(true), [])

  const onMouseLeave = useCallback(() => setVisible(false), [])

  return (
    <div
      className={`${props.className} tooltip  ${visible && 'tooltip-open'} before:hidden ${!visible && 'after:hidden'} after:bottom-[0.88rem]`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-tip
    >
      {
        visible
        && (
          <div ref={tooltipContentRef} className="absolute left-half translate-x-nhalf translate bottom-[1.25rem] rounded-[0.25rem] bg-ttc text-ttct p-1">
            {props.tooltip}
          </div>
        )
      }
      {props.children}
    </div>
  )
}

export default Tooltip
