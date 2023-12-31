import type { ELementRect } from '../type'

export function isEqualRect(rect1: ELementRect, rect2: ELementRect) {
  return rect1.x === rect2.x && rect1.y === rect2.y && rect1.width === rect2.width && rect1.height === rect2.height
}
