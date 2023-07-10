export function noThrow(fn: (...args: any) => Promise<any>) {
  return (...args: any) => fn(...args).catch(() => {})
}

// cover FormData to plain object
export function formDataToObject(formData: FormData) {
  const obj: Record<string, any> = {}
  formData.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}
