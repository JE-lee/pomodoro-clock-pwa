import { useEffect, useReducer, useRef, useState } from 'react'
import PomodoroClock from './components/PomodoroClock'
import type { IClockContext } from './type'
import { STATE } from './type'
import { SettingIcon } from './components/SvgIcon'
import { formDataToObject } from './shared'
import { ClockContext, defaultClockContext, getClockContext, saveClockContext } from './service'

function reducer(state: IClockContext, action: { type: string; payload: Partial<IClockContext> }): IClockContext {
  if (action.type === 'update') {
    if (action.payload.sessionTime)
      action.payload.sessionTime = Number(action.payload.sessionTime) || defaultClockContext.sessionTime
    if (action.payload.breakTime)
      action.payload.breakTime = Number(action.payload.breakTime) || defaultClockContext.breakTime

    return {
      ...state,
      ...action.payload,
    }
  }
  return state
}

const clockContextStoraged = getClockContext()

function App() {
  const [clockState, setClockState] = useState(STATE.BEFORE_RUN)
  const [clockSetting, dispatch] = useReducer(reducer, clockContextStoraged)
  const formRef = useRef<HTMLFormElement>(null)

  const updateSetting = (payload: Partial<IClockContext>) => {
    dispatch({ type: 'update', payload })
  }

  // save clock context to localStorage
  useEffect(() => {
    saveClockContext(clockSetting)
  }, [clockSetting])

  const onSettingClick = () => {
    const dialog = document.getElementById('settingModal') as HTMLDialogElement
    if (dialog) {
      formRef.current?.reset()
      dialog.showModal()
    }
  }

  const onSubmitClick = () => {
    if (!formRef.current)
      return
    const formData = new FormData(formRef.current)
    const data = formDataToObject(formData)
    data.silent = !!data.silent
    updateSetting(data)
  }

  const settingVisible = clockState === STATE.BEFORE_RUN || clockState === STATE.PAUSED
  const bgApp = (clockState === STATE.BEFORE_BREAK || clockState === STATE.BREAKING) ? 'bg-app-peace' : 'bg-app'
  return (
    <ClockContext.Provider value={{ ...clockSetting, update: updateSetting }}>
      <div className={`flex flex-col items-center justify-center w-full h-screen ${bgApp}`}>
        <PomodoroClock clockState={clockState} setClockState={setClockState}></PomodoroClock>
        {
          settingVisible
          && <div className="w-6 fixed bottom-5 right-5 text-[#FD7477] hover:text-[#FC5E7B] transition duration-500 cursor-pointer" onClick={onSettingClick}>
            <SettingIcon></SettingIcon>
          </div>
        }
        <dialog id="settingModal" className="modal">
          <form ref={formRef} method="dialog" className="modal-box w-80">
            <button className="absolute btn btn-sm btn-circle btn-ghost right-4 top-4">✕</button>
            <h3 className="text-lg font-bold">SETTING</h3>

            <div className="w-full max-w-xs form-control">
              <label className="label">
                <span className="label-text">Session time</span>
              </label>
              <input name="sessionTime" type="number" step={0.01} defaultValue={clockSetting.sessionTime} placeholder="Type here" className="w-full max-w-xs input input-reset input-sm input-bordered" />
            </div>

            <div className="w-full max-w-xs form-control">
              <label className="label">
                <span className="label-text">Session Hints</span>
              </label>
              <input name="sessionHints" defaultValue={clockSetting.sessionHints} placeholder="Type here" className="w-full max-w-xs input input-sm input-bordered" />
            </div>

            <div className="w-full max-w-xs form-control">
              <label className="label">
                <span className="label-text">Break time</span>
              </label>
              <input name="breakTime" step={0.01} defaultValue={clockSetting.breakTime} type="number" placeholder="Type here" className="w-full max-w-xs input input-reset input-sm input-bordered " />
            </div>

            <div className="w-full max-w-xs form-control">
              <label className="label">
                <span className="label-text">Break Hints</span>
              </label>
              <input name="breakHints" defaultValue={clockSetting.breakHints} placeholder="Type here" className="w-full max-w-xs input input-sm input-bordered" />
            </div>

            <div className="w-full max-w-xs form-control">
              <label className="label">
                <span className="label-text">Silent</span>
              </label>
              <input name="silent" defaultChecked={clockSetting.silent} type="checkbox" className="toggle toggle-sm" />
            </div>

            <div className="modal-action">
              <button className="btn btn-sm text-white bg-[#FC5E7B]" onClick={onSubmitClick}>submit</button>
            </div>
          </form>
        </dialog>
      </div>
    </ClockContext.Provider>
  )
}

export default App
