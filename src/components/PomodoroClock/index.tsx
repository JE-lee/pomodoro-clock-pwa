import { useCallback, useEffect, useState } from 'react'
import type { FC } from 'react'
import { countDownTime, formatTime } from '../../shared'
import { STATE } from '../../type'
import { PauseIcon, PlayIcon, ResetIcon } from '../SvgIcon'
import { notify } from '../../service/notification'
import NumberInput from './NumberInput'

interface PomodoroClockProps {
  clockState: STATE
  setClockState: (state: STATE) => void
}

const PomodoroClock: FC<PomodoroClockProps> = (props) => {
  const [sessionRound, setSessionRound] = useState(1)
  const [breakRound, setBreakRound] = useState(1)
  const [sessionTime, setSessionTime] = useState(30)
  const [breakTime, setBreakTime] = useState(2)
  const [restSeconds, setRestSeconds] = useState(sessionTime * 60)

  const onSesionTimeChange = useCallback((value: number) => {
    setSessionTime(value)
    setRestSeconds(value * 60)
  }, [])

  const onBreakTimeChange = useCallback((value: number) => {
    setBreakTime(value)
  }, [])

  useEffect(() => {
    if (props.clockState === STATE.RUNNING) {
      // start session
      return countDownTime(
        restSeconds,
        seconds => setRestSeconds(seconds),
        async () => {
          // notify session end
          await notify('It\'s time to take a break!')
          setSessionRound(sessionRound + 1)
          props.setClockState(STATE.RESTING)
        },
      )
    }
    else if (props.clockState === STATE.RESTING) {
      setRestSeconds(breakTime * 60)
      return countDownTime(
        breakTime * 60,
        seconds => setRestSeconds(seconds),
        async () => {
          // notify break end
          await notify('It\'s time to work!')
          props.setClockState(STATE.RUNNING)
          setRestSeconds(sessionTime * 60)
          setBreakRound(breakRound + 1)
        },
      )
    }
  }, [props.clockState])

  const onSessionClick = () => {
    // start or resume the session
    if (props.clockState === STATE.WAITING || props.clockState === STATE.PAUSED)
      props.setClockState(STATE.RUNNING)

    // pause the session
    else
      props.setClockState(STATE.PAUSED)
  }

  // restart current session
  const onResetClick = () => {
    setRestSeconds(sessionTime * 60)
    props.setClockState(STATE.RUNNING)
  }

  const inSession = props.clockState === STATE.RUNNING || props.clockState === STATE.RESTING
  let stateText = inSession ? `Session ${sessionRound}` : 'Ready?'
  if (props.clockState === STATE.RESTING)
    stateText = inSession ? `Break ${breakRound}` : 'Resting'

  const actionVisible = props.clockState !== STATE.RESTING

  return (
    <div className="flex flex-col items-center select-none">
      <div className="w-[55vmin] min-w-[360px] aspect-square min-h-[360px]
      flex flex-col justify-center items-center bg-pomodoro bg-center bg-no-repeat bg-contain text-xs sm:text-sm xl:text-base 2xl:text-lg">
        <div className="text-[2.2em] leading-tight text-[#FD7477]">{stateText}</div>
        <div className="text-[4em] leading-none font-semibold text-[#FC5E7B]">{formatTime(restSeconds)}</div>
        {
          actionVisible
          && (
            <>
              { props.clockState === STATE.RUNNING
                && <div className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
                  onClick={onSessionClick}>
                  <PauseIcon className="w-3 mr-1"></PauseIcon>
                  <span>PAUSE</span>
                </div>
              }
              { (props.clockState === STATE.WAITING || props.clockState === STATE.PAUSED)
                  && <div className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
                  onClick={onSessionClick}>
                  <PlayIcon className="w-3 mr-1"></PlayIcon>
                  <span>START</span>
                </div>
              }
              {props.clockState === STATE.PAUSED
                    && <div className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
                          onClick={onResetClick}>
                      <ResetIcon className="w-3 mr-1"></ResetIcon>
                      <span>Reset</span>
                    </div>
                  }
            </>
          )
        }
      </div>
      {/* controls */}
      {
        !inSession
         && <div className="flex items-center mt-8">
           <NumberInput label="SESSION" value={sessionTime}
           onChange={onSesionTimeChange} min={0}></NumberInput>
           <NumberInput label="BREAK" className="ml-5" value={breakTime} onChange={onBreakTimeChange} min={0}></NumberInput>
         </div>
      }
    </div>
  )
}

export default PomodoroClock
