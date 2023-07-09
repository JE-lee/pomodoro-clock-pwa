export enum STATE {
  BEFORE_RUN,
  RUNNING,
  PAUSED,
  BEFORE_BREAK,
  BREAKING,
}

export interface ELementRect {
  x: number
  y: number
  width: number
  height: number
}
