import { useRef } from 'react'

export function useFade() {
  const elRef = useRef<HTMLDivElement>(null)

  function fadeIn(duration?: number) {
    if (!elRef.current)
      return
    elRef.current.style.display = 'inherit'
    elRef.current.animate([
      { opacity: 0 },
      { opacity: 1 },
    ], { duration: duration ?? 800, easing: 'ease' })
  }

  function fadeOut(duration?: number) {
    if (!elRef.current)
      return

    const rect = elRef.current.getBoundingClientRect()
    elRef.current.style.position = 'absolute'
    const rect2 = elRef.current.getBoundingClientRect()
    const xOffset = -(rect2.x - rect.x)
    const yOffset = -(rect2.y - rect.y)
    elRef.current.style.transform = `translate(${xOffset}px, ${yOffset}px)`
    const animation = elRef.current.animate([
      { opacity: 1 },
      { opacity: 0 },
    ], { duration: duration ?? 400, easing: 'ease' })
    animation.onfinish = () => {
      if (elRef.current) {
        elRef.current.style.display = 'none'
        elRef.current.style.position = 'inherit'
        elRef.current.style.transform = 'none'
      }
    }
  }

  return {
    elRef,
    fadeIn,
    fadeOut,
  }
}
