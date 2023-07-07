import type { ChangeEvent, FC } from 'react'

interface NumberInputProps {
  className?: string
  label?: string
  value: number
  onChange?: (value: number) => void
  max?: number
  min?: number
}

interface ArrowBaseProps {
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}

const ArrowWrapper: FC<ArrowBaseProps> = (props) => {
  return (
    <div className="px-8 py-2 cursor-pointer" onClick={props.onClick}>{ props.children }</div>
  )
}

const Arrowup: FC<Pick<ArrowBaseProps, 'onClick'>> = (props) => {
  return (
    <ArrowWrapper onClick={props.onClick}>
      <svg className="w-4 text-[#FF848A]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" >
        <path fill="currentColor" d="M177 255.7l136 136c9.4 9.4 9.4 24.6 0 33.9l-22.6 22.6c-9.4 9.4-24.6 9.4-33.9 0L160 351.9l-96.4 96.4c-9.4 9.4-24.6 9.4-33.9 0L7 425.7c-9.4-9.4-9.4-24.6 0-33.9l136-136c9.4-9.5 24.6-9.5 34-.1zm-34-192L7 199.7c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l96.4-96.4 96.4 96.4c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9l-136-136c-9.2-9.4-24.4-9.4-33.8 0z">
        </path>
      </svg>
    </ArrowWrapper>
  )
}

const ArrowDown: FC<{ className?: string } & Pick<ArrowBaseProps, 'onClick'>> = (props) => {
  return (
    <ArrowWrapper onClick={props.onClick}>
      <svg className={`w-4 text-[#FC3A80] ${props.className}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" >
        <path fill="currentColor" d="M143 256.3L7 120.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0L313 86.3c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.4 9.5-24.6 9.5-34 .1zm34 192l136-136c9.4-9.4 9.4-24.6 0-33.9l-22.6-22.6c-9.4-9.4-24.6-9.4-33.9 0L160 352.1l-96.4-96.4c-9.4-9.4-24.6-9.4-33.9 0L7 278.3c-9.4 9.4-9.4 24.6 0 33.9l136 136c9.4 9.5 24.6 9.5 34 .1z">
        </path>
      </svg>
    </ArrowWrapper>
  )
}

const NumberInput: FC<NumberInputProps> = (props) => {
  const doChange = (value: number) => {
    value = Math.max(props.min ?? value, Math.min(props.max ?? value, value))
    props.onChange?.(value)
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    doChange(Number.parseInt(event.target.value, 10))
  }

  const doIncrease = (delta = 1) => {
    doChange(props.value + delta)
  }

  const doDecrease = (delta = 1) => {
    doChange(props.value - delta)
  }

  return (
    <div className={`flex flex-col items-center select-none ${props.className}`}>
      <Arrowup onClick={() => doIncrease(1)}></Arrowup>
      <div className="flex flex-col items-center">
        <span className="text-md font-semibold text-[#FC5C7B]">{ props.label }</span>
        <input type="number" className="w-[80px] text-5xl leading-[74px] font-semobold text-center text-[#FC4680]
            bg-gradient-to-b from-[#fff0f0] to-[#ffd2e0]
            border-l-0 border-r-0 border-t-0 outline-none rounded-lg
            border-b-[6px] border-[#FC4680] input-reset" value={props.value} onChange={onChange} max={props.max} min={props.min}/>
      </div>
      <ArrowDown onClick={() => doDecrease(1)}></ArrowDown>
    </div>
  )
}

export default NumberInput
