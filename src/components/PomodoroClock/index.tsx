import { useCallback, useEffect, useState } from 'react'
import type { FC } from 'react'
import { formatTime, noThrow } from '../../shared'
import { STATE } from '../../type'
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from '../SvgIcon'
import { useCountdown, useNotification } from '../../service'
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
  const { confirm, closeNotification } = useNotification()
  const { countdownTime } = useCountdown()

  const onSesionTimeChange = useCallback((value: number) => {
    setSessionTime(value)
    setRestSeconds(value * 60)
  }, [])

  const onBreakTimeChange = useCallback((value: number) => {
    setBreakTime(value)
  }, [])

  useEffect(() => {
    if (props.clockState === STATE.BEFORE_RUN) {
      setRestSeconds(sessionTime * 60)
    }
    else if (props.clockState === STATE.RUNNING) {
      // start session
      return countdownTime(
        restSeconds,
        seconds => setRestSeconds(seconds),
        noThrow(async () => {
          setSessionRound(sessionRound + 1)
          props.setClockState(STATE.BEFORE_BREAK)
          // notify session end
          await confirm('It\'s time to take a break!')
          props.setClockState(STATE.BREAKING)
          // make sure window is frontground
          // it works on PWA
          window.focus()
        }),
      )
    }
    else if (props.clockState === STATE.BEFORE_BREAK) {
      setRestSeconds(breakTime * 60)
    }
    else if (props.clockState === STATE.BREAKING) {
      return countdownTime(
        breakTime * 60,
        seconds => setRestSeconds(seconds),
        noThrow(async () => {
          setBreakRound(breakRound + 1)
          setRestSeconds(sessionTime * 60)
          props.setClockState(STATE.BEFORE_RUN)
          // notify break end
          await confirm('It\'s time to work!')
          props.setClockState(STATE.RUNNING)
          // make sure window is frontground
          // it works on PWA
          window.focus()
        }),
      )
    }
  }, [props.clockState, sessionTime, breakTime])

  const doStartSession = (restart = true) => {
    closeNotification()
    restart && setRestSeconds(sessionTime * 60)
    props.setClockState(STATE.RUNNING)
  }

  const doPauseSession = () => props.setClockState(STATE.PAUSED)

  // restart current session
  const onResetClick = () => {
    setRestSeconds(sessionTime * 60)
    props.setClockState(STATE.RUNNING)
  }

  const doStartBreak = () => {
    closeNotification()
    props.setClockState(STATE.BREAKING)
  }

  const doSkipBreak = () => {
    closeNotification()
    setRestSeconds(sessionTime * 60)
    props.setClockState(STATE.RUNNING)
  }

  const inSession = props.clockState !== STATE.PAUSED && props.clockState !== STATE.BEFORE_RUN
  let stateText = inSession ? `Session ${sessionRound}` : 'Ready?'
  if (props.clockState === STATE.BEFORE_BREAK || props.clockState === STATE.BREAKING)
    stateText = inSession ? `Break ${breakRound}` : 'Resting'

  return (
    <div className="flex flex-col items-center select-none">
      <div className="w-[55vmin] min-w-[360px] aspect-square min-h-[360px]
      flex flex-col justify-center items-center bg-pomodoro bg-center bg-no-repeat bg-contain text-xs sm:text-sm xl:text-base 2xl:text-lg">
        <div className="text-[2.2em] leading-tight text-[#FD7477]">{stateText}</div>
        <div className="text-[4em] leading-none font-semibold text-[#FC5E7B]">{formatTime(restSeconds)}</div>
        { props.clockState === STATE.RUNNING
          && <div className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
            onClick={doPauseSession}>
            <PauseIcon className="w-3 mr-1"></PauseIcon>
            <span>PAUSE</span>
          </div>
        }
        { (props.clockState === STATE.BEFORE_RUN || props.clockState === STATE.PAUSED)
            && <div className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
            onClick={() => doStartSession(props.clockState === STATE.BEFORE_RUN)}>
            <PlayIcon className="w-3 mr-1"></PlayIcon>
            <span>START</span>
          </div>
        }
        { (props.clockState === STATE.BEFORE_BREAK)
            && <div className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
            onClick={doStartBreak}>
            <PlayIcon className="w-3 mr-1"></PlayIcon>
            <span>START</span>
          </div>
        }
        { (props.clockState === STATE.BREAKING)
            && <div className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
            onClick={doSkipBreak}>
            <SkipIcon className="w-5 mr-1"></SkipIcon>
            <span>SKIP</span>
          </div>
        }
        {props.clockState === STATE.PAUSED
            && <div className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
                onClick={onResetClick}>
            <ResetIcon className="w-3 mr-1"></ResetIcon>
            <span>Reset</span>
          </div>
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
