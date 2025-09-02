import type { FC } from 'react'
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Flipped, Flipper } from 'react-flip-toolkit'
import { twMerge } from 'tailwind-merge'
import { addThread, ClockContext, HeatMapContext, useCountdown, useNotification } from '../../service'
import { formatMinAndSec, isEqualDate, noThrow } from '../../shared'
import { STATE, ThreadType } from '../../type'
import NumberInput from '../NumberInput'
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from '../SvgIcon'
import { PomodoroStateMachine, StateMachineContext, StateMachineEvent } from '../../service/stateMachine'

interface PomodoroClockProps {
  clockState: STATE
  setClockState: (state: STATE) => void
}

const PomodoroClock: FC<PomodoroClockProps> = (props) => {
  const { sessionTime, breakTime, sessionHints, breakHints, silent, update: updateSetting } = useContext(ClockContext)
  const { refresh: refreshHeatMap } = useContext(HeatMapContext)
  const shouldShowNotiPermissionModal = useRef(true)
  const currentDate = useRef<Date>(new Date())
  const controlsRef = useRef<HTMLDivElement>(null)
  const controlsRect = useRef<DOMRect>()
  const countdownCleanupRef = useRef<(() => void) | null>(null)

  const { confirm, closeNotification } = useNotification()
  const { countdownTime } = useCountdown()

  // 创建状态机实例
  const stateMachineRef = useRef<PomodoroStateMachine | null>(null)
  if (!stateMachineRef.current) {
    const stateMachineContext: StateMachineContext = {
      sessionTime,
      breakTime,
      sessionHints,
      breakHints,
      silent
    }
    stateMachineRef.current = new PomodoroStateMachine(props.clockState, stateMachineContext, refreshHeatMap)
  }

  // 更新状态机上下文
  useEffect(() => {
    const stateMachineContext: StateMachineContext = {
      sessionTime,
      breakTime,
      sessionHints,
      breakHints,
      silent
    }
    stateMachineRef.current?.updateContext(stateMachineContext)
  }, [sessionTime, breakTime, sessionHints, breakHints, silent])

  // 获取状态机当前状态
  const machineState = stateMachineRef.current?.getCurrentState() || {
    currentState: props.clockState,
    restSeconds: sessionTime * 60,
    sessionRound: 1,
    breakRound: 1,
    threadStartTimestamp: Date.now()
  }

  const inSession = machineState.currentState !== STATE.PAUSED && machineState.currentState !== STATE.BEFORE_RUN

  // 处理状态机事件
  const handleStateMachineEvent = useCallback(async (event: StateMachineEvent) => {
    if (!stateMachineRef.current) return

    const result = await stateMachineRef.current.handleEvent(event)
    
    // 更新状态机内部状态
    stateMachineRef.current.updateState(
      result.newState, 
      result.restSeconds, 
      {
        sessionRound: result.sessionRound,
        breakRound: result.breakRound,
        threadStartTimestamp: result.threadStartTimestamp
      }
    )

    // 更新 React 状态
    props.setClockState(result.newState)
    setRestSeconds(result.restSeconds)
    
    if (result.sessionRound !== undefined) {
      setSessionRound(result.sessionRound)
    }
    
    if (result.breakRound !== undefined) {
      setBreakRound(result.breakRound)
    }

    // 处理数据库保存
    if (result.shouldSaveSession) {
      await stateMachineRef.current.saveSessionToDB(sessionTime * 60)
    }
    
    if (result.shouldSaveBreak) {
      await stateMachineRef.current.saveBreakToDB(breakTime * 60)
    }

    // 处理通知
    if (result.showNotification) {
      try {
        await confirm(result.showNotification.message, result.showNotification.icon)
        if (!silent) window.focus()
        // 在用户点击通知后，触发下一个状态
        if (result.newState === STATE.BEFORE_BREAK) {
          // 工作时段完成，开始休息
          await handleStateMachineEvent('START')
        } else if (result.newState === STATE.BEFORE_RUN) {
          // 休息时段完成，开始工作
          await handleStateMachineEvent('START')
        }
      } catch (error) {
        console.error('Notification error:', error)
      }
    }
  }, [props, sessionTime, breakTime, confirm, silent])

  // React 状态
  const [sessionRound, setSessionRound] = useState(machineState.sessionRound)
  const [breakRound, setBreakRound] = useState(machineState.breakRound)
  const [restSeconds, setRestSeconds] = useState(machineState.restSeconds)

  // 获取状态显示文本和时间
  const stateText = stateMachineRef.current?.getStateText() || 'Ready?'
  // 使用 React 状态而不是状态机状态来显示时间
  const displayTime = formatMinAndSec(restSeconds)

  // 创建倒计时
  const createCountdown = useCallback((onComplete: () => void) => {
    const cleanup = countdownTime(restSeconds, (newRestSeconds) => {
      // 更新 React 状态
      setRestSeconds(newRestSeconds)
      // 同时更新状态机内部状态以保持同步
      if (stateMachineRef.current) {
        const currentState = stateMachineRef.current.getCurrentState()
        stateMachineRef.current.updateState(
          currentState.currentState,
          newRestSeconds,
          {
            sessionRound: currentState.sessionRound,
            breakRound: currentState.breakRound,
            threadStartTimestamp: currentState.threadStartTimestamp
          }
        )
      }
    }, () => {
      try {
        onComplete()
      } catch (error) {
        console.error('Timer complete error:', error)
      }
    })
    return cleanup
  }, [restSeconds, setRestSeconds, countdownTime])

  // 处理计时器 tick
  const handleTimerTick = useCallback(() => {
    handleStateMachineEvent('TIMER_TICK')
  }, [handleStateMachineEvent])

  // 处理计时器完成
  const handleTimerComplete = useCallback(() => {
    handleStateMachineEvent('COMPLETE')
  }, [handleStateMachineEvent])

  // 启动倒计时
  const startCountdown = useCallback(() => {
    if (countdownCleanupRef.current) {
      countdownCleanupRef.current()
    }
    
    countdownCleanupRef.current = createCountdown(handleTimerComplete)
  }, [createCountdown, handleTimerComplete])

  // 监听状态变化以启动倒计时
  useEffect(() => {
    if (props.clockState === STATE.RUNNING || props.clockState === STATE.BREAKING) {
      startCountdown()
    }
    
    return () => {
      if (countdownCleanupRef.current) {
        countdownCleanupRef.current()
        countdownCleanupRef.current = null
      }
    }
  }, [props.clockState, startCountdown])

  useLayoutEffect(() => {
    if (!inSession && !controlsRect.current)
      controlsRect.current = controlsRef.current?.getBoundingClientRect()
  }, [inSession])

  const onSesionTimeChange = useCallback((value: number) => {
    value = +value.toFixed(1)
    updateSetting?.({ sessionTime: value })
    setRestSeconds(Math.round(value * 60))
  }, [updateSetting])

  const onBreakTimeChange = useCallback((value: number) => {
    value = +value.toFixed(1)
    updateSetting?.({ breakTime: value })
  }, [updateSetting])

  const doStartSession = async (fresh = true) => {
    // request notification permission
    if (Notification.permission !== 'granted')
      showNotiPermissionModal()

    maybeResetContext()

    closeNotification()

    const ifAnotherDay = !isEqualDate(currentDate.current!, new Date())
    if (ifAnotherDay || fresh) {
      // 更新线程开始时间戳
      if (stateMachineRef.current) {
        const currentState = stateMachineRef.current.getCurrentState()
        stateMachineRef.current.updateState(
          currentState.currentState,
          currentState.restSeconds,
          { threadStartTimestamp: Date.now() }
        )
      }
      setRestSeconds(Math.round(sessionTime * 60))
    }
    // 如果不是 fresh（即恢复暂停的会话），保持当前的 restSeconds 不变

    handleStateMachineEvent('START')
  }

  const doPauseSession = () => handleStateMachineEvent('PAUSE')

  // restart current session
  const onResetClick = () => {
    maybeResetContext()
    setRestSeconds(Math.round(sessionTime * 60))
    handleStateMachineEvent('RESET')
  }

  const doStartBreak = () => {
    maybeResetContext()
    closeNotification()
    
    // 更新线程开始时间戳
    if (stateMachineRef.current) {
      const currentState = stateMachineRef.current.getCurrentState()
      stateMachineRef.current.updateState(
        currentState.currentState,
        currentState.restSeconds,
        { threadStartTimestamp: Date.now() }
      )
    }
    
    handleStateMachineEvent('START')
  }

  const doSkipBreak = () => {
    maybeResetContext()
    closeNotification()
    setRestSeconds(Math.round(sessionTime * 60))
    handleStateMachineEvent('SKIP')
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

  return (
    <Flipper flipKey={inSession}>
      <div className="flex flex-col items-center select-none">
        <Flipped flipId="clock">
          <div
            className="w-[55vmin] min-w-[360px] aspect-square min-h-[360px]
                flex flex-col justify-center items-center bg-pomodoro bg-center bg-no-repeat bg-contain text-xs sm:text-sm xl:text-base 2xl:text-lg"
          >
            <div className="text-[2.2em] leading-tight text-[#FD7477]">{stateText}</div>
            <div className="text-[4em] leading-none font-semibold text-[#FC5E7B]">{displayTime}</div>
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
              <NumberInput label="SESSION" value={sessionTime} onChange={onSesionTimeChange} min={0} />
              <NumberInput
                label="BREAK"
                className="ml-5"
                value={breakTime}
                onChange={onBreakTimeChange}
                min={0}
              />
            </div>
          )}
        </Flipped>
        <dialog id="notiPermissionModal" className="modal">
          <form method="dialog" className="modal-box">
            <button className="absolute btn btn-sm btn-circle btn-ghost right-2 top-2">x</button>
            <h3 className="text-lg font-bold">Hello</h3>
            <p className="py-2">
              {"The app requires you to authorize your browser's notification permissions for an optimal experience!"}
            </p>
            <p className="py-2">
              Please click the button in the upper left corner of your browser to re-authorize, or check out
              &nbsp;
              <a className="link" href="https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DDesktop" target="_blank" rel="noreferrer">this page</a>
              {' '}
              for help.
              &nbsp;if you are using mac, look at
              <a className="link" target="_blank" href="https://support.apple.com/en-hk/guide/safari/sfri40734/mac" rel="noreferrer">this website</a>
              {' '}
              for help.
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
      </div>
    </Flipper>
  )
}

export default PomodoroClock
