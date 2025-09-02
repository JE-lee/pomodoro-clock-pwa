let timer = null
function countDownTime(seconds) {
  // 创建一个本地变量，避免修改传入的参数
  let remainingSeconds = seconds
  function tick() {
    timer = setTimeout(() => {
      remainingSeconds--
      self.postMessage({ type: 'countdown:tick', payload: remainingSeconds})
      if (remainingSeconds === 0) {
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
