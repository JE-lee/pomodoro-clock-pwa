import { useEffect } from 'react'

export function useWindowResize(handleResize: () => void) {
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })
}
