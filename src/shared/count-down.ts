export function countDownTime(seconds: number, onTick: (restSeconds: number) => void, onDone = () => {}) {
  let timer: unknown
  function tick() {
    timer = setTimeout(() => {
      onTick(--seconds)
      if (seconds === 0)
        return onDone()
      tick()
    }, 1000)
  }

  tick()
  return () => clearTimeout(timer as number)
}
