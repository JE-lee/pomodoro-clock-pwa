export function formatMinAndSec(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

// days of week full name
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

// months full name
const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
] as const

export function formatHumanReadableDate(time: string | Date | number) {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = MONTHS[date.getMonth()]
  const day = DAYS[date.getDay()]
  return `${day}, ${month} ${date.getDate()}, ${year}`
}

export function getDateRaw(time: string | Date | number) {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dayInMonth = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${dayInMonth}`
}
