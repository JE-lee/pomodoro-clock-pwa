let timer = null
function countDownTime(seconds) {
  function tick() {
    timer = setTimeout(() => {
      self.postMessage({ type: 'countdown:tick', payload: --seconds})
      if (seconds === 0) {
        self.postMessage({ type: 'countdown:done' })
        timer = null
        return
      }
      tick()
    }, 1000)
  }

  tick()
}

self.addEventListener('message', ({ data }) => {
  const { type, payload: seconds } = data || {}
  if (type === 'countdown:start') {
    clearTimeout(timer)
    countDownTime(seconds)
  } else if (type === 'countdown:stop') {
    clearTimeout(timer)
    timer = null
  }
})
