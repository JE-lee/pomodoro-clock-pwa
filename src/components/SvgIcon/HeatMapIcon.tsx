import type { FC } from 'react'

export const HeatMapIcon: FC<{ className?: string }> = (props) => {
  return (
    <svg className={props.className} viewBox="0 0 1024 1024"xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1002.682182 21.317818v981.364364H21.317818V21.317818h981.364364zM341.317818 661.317818H64v298.682182h277.317818v-298.682182z m618.682182 0h-277.317818v298.682182h277.317818v-298.682182zM341.317818 362.682182H64v256h277.317818v-256z m298.682182 0h-256v256h256v-256z m0-298.682182h-256v256h256v-256z m320 0h-277.317818v256h277.317818v-256z"
        fill="currentColor"
      >
      </path>
    </svg>
  )
}
