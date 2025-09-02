import { STATE, ThreadType } from '../type'
import { addThread, getThreadsOfDay } from './db'
import { formatMinAndSec } from '../shared'

// 状态机事件类型
export type StateMachineEvent = 
  | 'START' 
  | 'PAUSE' 
  | 'RESET' 
  | 'SKIP' 
  | 'COMPLETE' 
  | 'TIMER_TICK'

// 状态机上下文
export interface StateMachineContext {
  sessionTime: number
  breakTime: number
  sessionHints: string
  breakHints: string
  silent: boolean
}

// 状态机状态数据
export interface MachineState {
  currentState: STATE
  restSeconds: number
  sessionRound: number
  breakRound: number
  threadStartTimestamp: number
}

// 状态机转换结果
export interface TransitionResult {
  newState: STATE
  restSeconds: number
  sessionRound?: number
  breakRound?: number
  shouldSaveSession?: boolean
  shouldSaveBreak?: boolean
  showNotification?: {
    message: string
    icon: string
  }
  threadStartTimestamp?: number
}

// 状态机类
export class PomodoroStateMachine {
  private state: MachineState
  private context: StateMachineContext
  private refreshHeatMap: () => void

  constructor(
    initialState: STATE, 
    context: StateMachineContext, 
    refreshHeatMap: () => void
  ) {
    this.state = {
      currentState: initialState,
      restSeconds: Math.round(context.sessionTime * 60),
      sessionRound: 1,
      breakRound: 1,
      threadStartTimestamp: Date.now()
    }
    this.context = context
    this.refreshHeatMap = refreshHeatMap
    
    // 初始化轮次计数
    this.initializeRounds()
  }

  private async initializeRounds() {
    try {
      const threads = await getThreadsOfDay(new Date())
      const sessions = threads.filter(t => t.type === ThreadType.SESSION)
      const breaks = threads.filter(t => t.type === ThreadType.BREAK)
      this.state.sessionRound = sessions.length + 1
      this.state.breakRound = breaks.length + 1
    } catch (error) {
      console.error('Failed to initialize rounds:', error)
    }
  }

  // 获取当前状态
  public getCurrentState(): MachineState {
    return { ...this.state }
  }

  // 获取显示时间
  public getDisplayTime(): string {
    return formatMinAndSec(this.state.restSeconds)
  }

  // 获取状态文本
  public getStateText(): string {
    const inSession = this.isInSession()
    
    switch (this.state.currentState) {
      case STATE.BEFORE_RUN:
        return inSession ? `Session ${this.state.sessionRound}` : 'Ready?'
      case STATE.RUNNING:
        return `Session ${this.state.sessionRound}`
      case STATE.PAUSED:
        return `Session ${this.state.sessionRound}`
      case STATE.BEFORE_BREAK:
        return inSession ? `Break ${this.state.breakRound}` : 'Resting'
      case STATE.BREAKING:
        return `Break ${this.state.breakRound}`
      default:
        return 'Ready?'
    }
  }

  // 判断是否在会话中
  private isInSession(): boolean {
    const { currentState } = this.state
    return currentState !== STATE.PAUSED && currentState !== STATE.BEFORE_RUN
  }

  // 处理事件
  public async handleEvent(event: StateMachineEvent, payload?: any): Promise<TransitionResult> {
    switch (this.state.currentState) {
      case STATE.BEFORE_RUN:
        return this.handleBeforeRun(event)
      case STATE.RUNNING:
        return this.handleRunning(event)
      case STATE.PAUSED:
        return this.handlePaused(event)
      case STATE.BEFORE_BREAK:
        return this.handleBeforeBreak(event)
      case STATE.BREAKING:
        return this.handleBreaking(event)
      default:
        return this.getDefaultTransition()
    }
  }

  private handleBeforeRun(event: StateMachineEvent): TransitionResult {
    switch (event) {
      case 'START':
        return {
          newState: STATE.RUNNING,
          restSeconds: Math.round(this.context.sessionTime * 60),
          threadStartTimestamp: Date.now()
        }
      case 'TIMER_TICK':
        return {
          newState: STATE.BEFORE_RUN,
          restSeconds: Math.max(0, this.state.restSeconds - 1)
        }
      default:
        return this.getDefaultTransition()
    }
  }

  private handleRunning(event: StateMachineEvent): TransitionResult {
    switch (event) {
      case 'PAUSE':
        return {
          newState: STATE.PAUSED,
          restSeconds: this.state.restSeconds
        }
      case 'RESET':
        return {
          newState: STATE.BEFORE_RUN,
          restSeconds: Math.round(this.context.sessionTime * 60),
          shouldSaveSession: true
        }
      case 'COMPLETE':
        return {
          newState: STATE.BEFORE_BREAK,
          restSeconds: Math.round(this.context.breakTime * 60),
          sessionRound: this.state.sessionRound + 1,
          shouldSaveSession: true,
          showNotification: {
            message: this.context.breakHints,
            icon: './break.png'
          }
        }
      case 'TIMER_TICK':
        return {
          newState: STATE.RUNNING,
          restSeconds: Math.max(0, this.state.restSeconds - 1)
        }
      default:
        return this.getDefaultTransition()
    }
  }

  private handlePaused(event: StateMachineEvent): TransitionResult {
    switch (event) {
      case 'START':
        return {
          newState: STATE.RUNNING,
          restSeconds: this.state.restSeconds
        }
      case 'RESET':
        return {
          newState: STATE.BEFORE_RUN,
          restSeconds: Math.round(this.context.sessionTime * 60),
          shouldSaveSession: true
        }
      default:
        return this.getDefaultTransition()
    }
  }

  private handleBeforeBreak(event: StateMachineEvent): TransitionResult {
    switch (event) {
      case 'START':
        return {
          newState: STATE.BREAKING,
          restSeconds: Math.round(this.context.breakTime * 60),
          threadStartTimestamp: Date.now()
        }
      case 'SKIP':
        return {
          newState: STATE.RUNNING,
          restSeconds: Math.round(this.context.sessionTime * 60)
        }
      case 'TIMER_TICK':
        return {
          newState: STATE.BEFORE_BREAK,
          restSeconds: Math.max(0, this.state.restSeconds - 1)
        }
      default:
        return this.getDefaultTransition()
    }
  }

  private handleBreaking(event: StateMachineEvent): TransitionResult {
    switch (event) {
      case 'SKIP':
        return {
          newState: STATE.RUNNING,
          restSeconds: Math.round(this.context.sessionTime * 60),
          breakRound: this.state.breakRound + 1,
          shouldSaveBreak: true
        }
      case 'COMPLETE':
        return {
          newState: STATE.BEFORE_RUN,
          restSeconds: Math.round(this.context.sessionTime * 60),
          breakRound: this.state.breakRound + 1,
          shouldSaveBreak: true,
          showNotification: {
            message: this.context.sessionHints,
            icon: './work.png'
          }
        }
      case 'TIMER_TICK':
        return {
          newState: STATE.BREAKING,
          restSeconds: Math.max(0, this.state.restSeconds - 1)
        }
      default:
        return this.getDefaultTransition()
    }
  }

  private getDefaultTransition(): TransitionResult {
    return {
      newState: this.state.currentState,
      restSeconds: this.state.restSeconds
    }
  }

  // 更新状态
  public updateState(newState: STATE, restSeconds: number, extras?: {
    sessionRound?: number
    breakRound?: number
    threadStartTimestamp?: number
  }) {
    this.state.currentState = newState
    this.state.restSeconds = restSeconds
    
    if (extras?.sessionRound !== undefined) {
      this.state.sessionRound = extras.sessionRound
    }
    
    if (extras?.breakRound !== undefined) {
      this.state.breakRound = extras.breakRound
    }
    
    if (extras?.threadStartTimestamp !== undefined) {
      this.state.threadStartTimestamp = extras.threadStartTimestamp
    }
  }

  // 保存会话到数据库
  public async saveSessionToDB(expectedTime: number) {
    try {
      await addThread({
        type: ThreadType.SESSION,
        startTimestamp: this.state.threadStartTimestamp,
        endTimestamp: Date.now(),
        expectedTime,
      })
      this.refreshHeatMap()
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  // 保存休息到数据库
  public async saveBreakToDB(expectedTime: number) {
    try {
      await addThread({
        type: ThreadType.BREAK,
        startTimestamp: this.state.threadStartTimestamp,
        endTimestamp: Date.now(),
        expectedTime,
      })
      this.refreshHeatMap()
    } catch (error) {
      console.error('Failed to save break:', error)
    }
  }

  // 更新上下文
  public updateContext(context: StateMachineContext) {
    this.context = context
  }
}