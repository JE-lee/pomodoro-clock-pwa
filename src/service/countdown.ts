import { useEffect, useRef } from 'react'

export function useCountdown() {
  const workerRef = useRef<Worker | null>(null)
  const onMessageRef = useRef<(e: MessageEvent) => void>()
  if (!workerRef.current)
    workerRef.current = new Worker('./timer.worker.js')

  const countdownTime = (seconds: number, onTick: (restSeconds: number) => void, onDone: OnDoneCallback) => {
    workerRef.current?.removeEventListener('message', onMessageRef.current!)
    let startTimestamp: number

    onMessageRef.current = (e: MessageEvent) => {
      const { type, payload } = e.data
      if (type === 'countdown:tick')
        onTick(payload)

      else if (type === 'countdown:done')
        onDone({ startTimestamp, duration: Math.floor((Date.now() - startTimestamp) / 1000) })
    }
    workerRef.current?.addEventListener('message', onMessageRef.current)
    startTimestamp = Date.now()
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

interface OnDoneCallback {
  (ctx: { startTimestamp: number; duration: number }): void
}
