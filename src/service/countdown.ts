import { useEffect, useRef } from 'react'

export function useCountdown() {
  const workerRef = useRef<Worker | null>(null)
  const onMessageRef = useRef<(e: MessageEvent) => void>()
  if (!workerRef.current)
    workerRef.current = new Worker('./timer.worker.js')

  const countdownTime = (seconds: number, onTick: (restSeconds: number) => void, onDone: () => {}) => {
    workerRef.current?.removeEventListener('message', onMessageRef.current!)

    onMessageRef.current = (e: MessageEvent) => {
      const { type, payload } = e.data
      if (type === 'countdown:tick')
        onTick(payload)

      else if (type === 'countdown:done')
        onDone()
    }
    workerRef.current?.addEventListener('message', onMessageRef.current)
    workerRef.current?.postMessage({ type: 'countdown:start', payload: seconds })
    return () => {
      // stop countdown
      workerRef.current?.postMessage({ type: 'countdown:stop' })
    }
  }

  useEffect(() => () => {
    workerRef.current?.postMessage({ type: 'countdown:stop' })
    workerRef.current?.terminate()
    workerRef.current = null
  }, [])

  return { countdownTime }
}
