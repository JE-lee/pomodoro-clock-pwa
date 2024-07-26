import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import { Flipped, Flipper } from 'react-flip-toolkit'
import { twMerge } from 'tailwind-merge'
import { formatMinAndSec, isEqualDate, noThrow } from '../../shared'
import { STATE, ThreadType } from '../../type'
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from '../SvgIcon'
import { ClockContext, HeatMapContext, addThread, getThreadsOfDay, useCountdown, useNotification } from '../../service'
import NumberInput from '../NumberInput'

interface PomodoroClockProps {
  clockState: STATE
  setClockState: (state: STATE) => void
}

const PomodoroClock: FC<PomodoroClockProps> = (props) => {
  const { sessionTime, breakTime, sessionHints, breakHints, silent, update: updateSetting } = useContext(ClockContext)
  const { refresh: refreshHeatMap } = useContext(HeatMapContext)
  const [sessionRound, setSessionRound] = useState(1)
  const [breakRound, setBreakRound] = useState(1)
  const [restSeconds, setRestSeconds] = useState(sessionTime * 60)
  const shouldShowNotiPermissionModal = useRef(true)
  const inSession = isInSession(props.clockState)
  const currentDate = useRef<Date>(new Date())
  const controlsRef = useRef<HTMLDivElement>(null)
  const controlsRect = useRef<DOMRect>()

  const threadStartTimestamp = useRef(Date.now())

  const { confirm, closeNotification } = useNotification()
  const { countdownTime } = useCountdown()

  // query rounds of session and break
  useEffect(() => {
    getThreadsOfDay(new Date()).then((threads) => {
      const sessions = threads.filter(t => t.type === ThreadType.SESSION)
      const breakds = threads.filter(t => t.type === ThreadType.BREAK)
      setSessionRound(sessions.length + 1)
      setBreakRound(breakds.length + 1)
    })
  }, [])

  useEffect(() => {
    if (props.clockState === STATE.BEFORE_RUN) {
      setRestSeconds(Math.round(sessionTime * 60))
    }
    else if (props.clockState === STATE.RUNNING) {
      // start session
      return countdownTime(
        restSeconds,
        seconds => setRestSeconds(seconds),
        noThrow(async () => {
          setSessionRound(sessionRound + 1)
          props.setClockState(STATE.BEFORE_BREAK)
          // save db
          addThread({
            type: ThreadType.SESSION,
            startTimestamp: threadStartTimestamp.current,
            endTimestamp: Date.now(),
            expectedTime: sessionTime * 60,
          }).then(refreshHeatMap)
          // notify session end
          await confirm(breakHints, './break.png')
          // make sure window is frontground
          // it works on PWA
          !silent && window.focus()
          props.setClockState(STATE.BREAKING)
        }),
      )
    }
    else if (props.clockState === STATE.BEFORE_BREAK) {
      setRestSeconds(Math.round(breakTime * 60))
    }
    else if (props.clockState === STATE.BREAKING) {
      return countdownTime(
        restSeconds,
        seconds => setRestSeconds(seconds),
        noThrow(async () => {
          setBreakRound(breakRound + 1)
          setRestSeconds(Math.round(sessionTime * 60))
          props.setClockState(STATE.BEFORE_RUN)
          // save db
          addThread({
            type: ThreadType.BREAK,
            startTimestamp: threadStartTimestamp.current,
            endTimestamp: Date.now(),
            expectedTime: breakTime * 60,
          }).then(refreshHeatMap)
          // notify break end
          await confirm(sessionHints, './work.png')
          // make sure window is frontground
          // it works on PWA
          !silent && window.focus()
          props.setClockState(STATE.RUNNING)
        }),
      )
    }
  }, [props.clockState, sessionTime, breakTime, sessionRound, breakRound, silent, sessionHints, breakHints])

  useLayoutEffect(() => {
    if (!inSession && !controlsRect.current)
      controlsRect.current = controlsRef.current?.getBoundingClientRect()
  }, [inSession])

  const onSesionTimeChange = useCallback((value: number) => {
    value = +value.toFixed(1)
    updateSetting?.({ sessionTime: value })
    setRestSeconds(Math.round(value * 60))
  }, [])

  const onBreakTimeChange = useCallback((value: number) => {
    value = +value.toFixed(1)
    updateSetting?.({ breakTime: value })
  }, [])

  const doStartSession = async (fresh = true) => {
    // request notification permission
    if (Notification.permission !== 'granted')
      showNotiPermissionModal()

    maybeResetContext()

    closeNotification()

    const ifAnotherDay = !isEqualDate(currentDate.current!, new Date())
    if (ifAnotherDay || fresh) {
      threadStartTimestamp.current = Date.now()
      setRestSeconds(Math.round(sessionTime * 60))
    }

    props.setClockState(STATE.RUNNING)
  }

  const doPauseSession = () => props.setClockState(STATE.PAUSED)

  // restart current session
  const onResetClick = () => {
    maybeResetContext()

    setRestSeconds(Math.round(sessionTime * 60))
    props.setClockState(STATE.BEFORE_RUN)
    // save db
    addThread({
      type: ThreadType.SESSION,
      startTimestamp: threadStartTimestamp.current,
      endTimestamp: Date.now(),
      expectedTime: sessionTime * 60,
    }).then(refreshHeatMap)
  }

  const doStartBreak = () => {
    maybeResetContext()

    closeNotification()
    threadStartTimestamp.current = Date.now()
    props.setClockState(STATE.BREAKING)
  }

  const doSkipBreak = () => {
    maybeResetContext()
    closeNotification()
    setRestSeconds(Math.round(sessionTime * 60))
    props.setClockState(STATE.RUNNING)
    // save db
    addThread({
      type: ThreadType.BREAK,
      startTimestamp: threadStartTimestamp.current,
      endTimestamp: Date.now(),
      expectedTime: breakTime * 60,
    }).then(refreshHeatMap)
  }

  function showNotiPermissionModal() {
    if (!shouldShowNotiPermissionModal.current)
      return

    const dialog = document.getElementById('notiPermissionModal') as HTMLDialogElement
    if (dialog) {
      dialog.close()
      dialog.showModal()
    }
  }

  function maybeResetContext() {
    const ifAnotherDay = !isEqualDate(currentDate.current!, new Date())
    if (ifAnotherDay) {
      currentDate.current = new Date()
      setSessionRound(1)
      setBreakRound(1)
      refreshHeatMap()
    }
  }

  let stateText = inSession ? `Session ${sessionRound}` : 'Ready?'
  if (props.clockState === STATE.BEFORE_BREAK || props.clockState === STATE.BREAKING)
    stateText = inSession ? `Break ${breakRound}` : 'Resting'

  return (
    <Flipper flipKey={inSession}>
      <div className="flex flex-col items-center select-none">
        <Flipped flipId="clock">
          <div
            className="w-[55vmin] min-w-[360px] aspect-square min-h-[360px]
                flex flex-col justify-center items-center bg-pomodoro bg-center bg-no-repeat bg-contain text-xs sm:text-sm xl:text-base 2xl:text-lg"
          >
            <div className="text-[2.2em] leading-tight text-[#FD7477]">{stateText}</div>
            <div className="text-[4em] leading-none font-semibold text-[#FC5E7B]">{formatMinAndSec(restSeconds)}</div>
            {props.clockState === STATE.RUNNING && (
              <button
                className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
                onClick={doPauseSession}
              >
                <PauseIcon className="w-3 mr-1"></PauseIcon>
                <span>PAUSE</span>
              </button>
            )}
            {(props.clockState === STATE.BEFORE_RUN || props.clockState === STATE.PAUSED) && (
              <button
                className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
                onClick={() => doStartSession(props.clockState === STATE.BEFORE_RUN)}
              >
                <PlayIcon className="w-3 mr-1"></PlayIcon>
                <span>START</span>
              </button>
            )}
            {props.clockState === STATE.BEFORE_BREAK && (
              <button
                className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
                onClick={doStartBreak}
              >
                <PlayIcon className="w-3 mr-1"></PlayIcon>
                <span>START</span>
              </button>
            )}
            {props.clockState === STATE.BREAKING && (
              <button
                className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
                onClick={doSkipBreak}
              >
                <SkipIcon className="w-5 mr-1"></SkipIcon>
                <span>SKIP</span>
              </button>
            )}
            {props.clockState === STATE.PAUSED && (
              <button
                className="flex items-center text-[1.4em] leading-tight font-simibold text-[#FC5E7B] cursor-pointer"
                onClick={onResetClick}
              >
                <ResetIcon className="w-3 mr-1"></ResetIcon>
                <span>Reset</span>
              </button>
            )}
          </div>
        </Flipped>
        {/* controls */}
        <Flipped
          flipId="control"
          onAppear={(el) => {
            const animation = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'ease' })
            animation.onfinish = () => el.style.opacity = '1'
          }}
          onExit={(el, index, removeElement) => {
            const { x: px, y: py } = controlsRect.current || {}
            if (!px || !py) {
              removeElement()
              return
            }

            const { x: cx, y: cy } = el.getBoundingClientRect()
            const xOffset = px - cx
            const yOffset = py - cy
            el.style.transform = `translate(${xOffset}px, ${yOffset}px)`
            const animation = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: 'ease' })
            animation.onfinish = removeElement
          }}
        >
          {!inSession && (
            <div ref={controlsRef} className={twMerge('flex items-center mt-8')}>
              <NumberInput label="SESSION" value={sessionTime} onChange={onSesionTimeChange} min={0}></NumberInput>
              <NumberInput
                label="BREAK"
                className="ml-5"
                value={breakTime}
                onChange={onBreakTimeChange}
                min={0}
              ></NumberInput>
            </div>
          )}
        </Flipped>
        {
          <dialog id="notiPermissionModal" className="modal">
            <form method="dialog" className="modal-box">
              <button className="absolute btn btn-sm btn-circle btn-ghost right-2 top-2">x</button>
              <h3 className="text-lg font-bold">Hello</h3>
              <p className="py-2">
                {'The app requires you to authorize your browser\'s notification permissions for an optimal experience!'}
              </p>
              <p className="py-2">
              Please click the button in the upper left corner of your browser to re-authorize, or check out
              &nbsp;<a className="link" href="https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DDesktop" target="_blank" rel="noreferrer">this page</a> for help.
              &nbsp;if you are using mac, look at  <a className="link" target="_blank" href="https://support.apple.com/en-hk/guide/safari/sfri40734/mac" rel="noreferrer">this website</a> for help.
              </p>
              <div className="modal-action">
              { Notification.permission === 'default' && <button className="btn btn-md text-white bg-[#FC5E7B]" onClick={() => Notification.requestPermission()}>AUTHORIZE</button>}
              <button className="btn btn-md" onClick={() => (shouldShowNotiPermissionModal.current = false)}>No more reminders</button>
              </div>
            </form>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        }
      </div>
    </Flipper>
  )
}

function isInSession(clockState: STATE) {
  return clockState !== STATE.PAUSED && clockState !== STATE.BEFORE_RUN
}

export default PomodoroClock
