import { useRef, useState } from 'react'
import PomodoroClock from './components/PomodoroClock'
import { STATE } from './type'
import { HeatMapIcon, SettingIcon } from './components/SvgIcon'
import { ClockContext, HeatMapContext, useClockSetting, useHeatMap } from './service'
import HeatMap from './components/HeatMap'
import { formDataToObject } from './shared'

function App() {
  const [clockState, setClockState] = useState(STATE.BEFORE_RUN)
  const formRef = useRef<HTMLFormElement>(null)
  const { clockSetting, updateClockSetting } = useClockSetting()
  const { heatMapData, refresh } = useHeatMap()

  const onSettingClick = () => {
    const dialog = document.getElementById('settingModal') as HTMLDialogElement
    if (dialog) {
      formRef.current?.reset()
      dialog.showModal()
    }
  }

  const onSubmit = () => {
    if (!formRef.current)
      return
    const formData = new FormData(formRef.current)
    const data = formDataToObject(formData)
    data.silent = !!data.silent
    updateClockSetting(data)
  }

  const bgApp = (clockState === STATE.BEFORE_BREAK || clockState === STATE.BREAKING) ? 'bg-app-peace' : 'bg-app'

  const main = (
    <div className={`flex flex-col items-center justify-center w-full h-screen ${bgApp}`}>
      <PomodoroClock clockState={clockState} setClockState={setClockState}></PomodoroClock>
      <div className="fixed flex items-center bottom-5 right-5">
        {
          <>
            <div className="hidden drawer drawer-bottom sm:block">
              <input id="heatmap-drawer" type="checkbox" className="drawer-toggle" />
              <div className="drawer-content">
                <label htmlFor="heatmap-drawer" className="drawer-button">
                  <div className="block w-6 flex-shrink-0  text-[#FD7477] hover:text-[#FC5E7B] transition duration-500 cursor-pointer">
                    <HeatMapIcon></HeatMapIcon>
                  </div>
                </label>
              </div>
              <div className="drawer-side">
                <label htmlFor="heatmap-drawer" className="drawer-overlay"></label>
                <div className="absolute bottom-0 w-screen px-4 py-8 overflow-x-auto border rounded 100vw bg-base-200">
                  <HeatMap className="mx-auto w-220" data={heatMapData}></HeatMap>
                </div>
              </div>
            </div>
            <button className="w-6 ml-2 flex-shrink-0  text-[#FD7477] hover:text-[#FC5E7B] transition duration-500 cursor-pointer" onClick={onSettingClick}>
              <SettingIcon></SettingIcon>
            </button>
          </>
        }
      </div>

      <dialog id="settingModal" className="modal">
        <form ref={formRef} method="dialog" className="modal-box w-80" onSubmit={onSubmit}>
          <button className="absolute btn btn-sm btn-circle btn-ghost right-4 top-4">✕</button>
          <h3 className="text-lg font-bold">SETTING</h3>

          <div className="w-full max-w-xs form-control">
            <label className="label">
              <span className="label-text">Session time / minutes</span>
            </label>
            <input name="sessionTime" step={0.1} type="number" defaultValue={clockSetting.sessionTime} placeholder="Type here" className="w-full max-w-xs input input-reset input-sm input-bordered" />
          </div>

          <div className="w-full max-w-xs form-control">
            <label className="label">
              <span className="label-text">Session Hints</span>
            </label>
            <input name="sessionHints" defaultValue={clockSetting.sessionHints} placeholder="Type here" className="w-full max-w-xs input input-sm input-bordered" />
          </div>

          <div className="w-full max-w-xs form-control">
            <label className="label">
              <span className="label-text">Break time / minutes</span>
            </label>
            <input name="breakTime" step={0.1} defaultValue={clockSetting.breakTime} type="number" placeholder="Type here" className="w-full max-w-xs input input-reset input-sm input-bordered " />
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
            <button className="btn btn-sm text-white bg-[#FC5E7B]">submit</button>
          </div>
        </form>
      </dialog>
    </div>
  )
  return (
    <ClockContext.Provider value={{ ...clockSetting, update: updateClockSetting }}>
      <HeatMapContext.Provider value={{ heatMapData, refresh }}>
        {main}
      </HeatMapContext.Provider>
    </ClockContext.Provider>
  )
}

export default App
