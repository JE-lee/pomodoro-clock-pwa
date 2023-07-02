import { useState } from 'react'
import PomodoroClock from './components/PomodoroClock'
import { STATE } from './type'

function App() {
  const [clockState, setClockState] = useState(STATE.WAITING)

  const bgApp = clockState === STATE.RESTING ? 'bg-app-peace' : 'bg-app'
  return (
    <div className={`flex flex-col items-center justify-center w-full h-screen ${bgApp}`}>
      <PomodoroClock clockState={clockState} setClockState={setClockState}></PomodoroClock>
    </div>
  )
}

export default App
