import { type FC, useLayoutEffect, useRef } from 'react'
import type { ELementRect } from '../../type'
import { isEqualRect } from '../../shared'

interface FlipProps {
  children: React.ReactNode
  duration?: number
  className?: string
  // This value change indicates that the position of the child element inside <Flip> has changed
  trigger: any
}

const Flip: FC<FlipProps> = (props) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const childRectMap = useRef<WeakMap<Element, ELementRect>>(new WeakMap())

  useLayoutEffect(() => {
    const childEls = boxRef.current?.children || []
    Array.from(childEls).forEach((el) => {
      const oldRect = childRectMap.current.get(el)
      const rect = el.getBoundingClientRect()
      if (oldRect) {
        if (!isEqualRect(rect, oldRect)) {
          // do animation
          const xOffset = -(rect.x - oldRect!.x)
          const yOffset = -(rect.y - oldRect!.y)
          const animation = el.animate([
            { transform: `translate(${xOffset}px, ${yOffset}px)` },
            { transform: 'translate(0, 0)' },
          ], { duration: props.duration || 400, easing: 'ease' })
          animation.play()
        }
      }
      childRectMap.current.set(el, rect)
    })
  }, [props.trigger])

  return (
    <div ref={boxRef} className={props.className}>{ props.children }</div>
  )
}

export default Flip
