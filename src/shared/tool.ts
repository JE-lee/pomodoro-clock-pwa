export function noThrow(fn: (...args: any) => Promise<any>) {
  return (...args: any) => fn(...args).catch(() => {})
}
