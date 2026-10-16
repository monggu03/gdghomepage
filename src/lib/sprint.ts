import { dayValue } from './date'

/** 지금 몇 번째 단계인지와, 이전 단계에서 얼마나 왔는지 (0~1) */
export function sprintProgress(dates: readonly string[], today: string): { current: number; ratio: number } {
  const t = dayValue(today)
  const values = dates.map(dayValue)
  const current = values.findIndex((v) => v > t)
  if (current === -1) return { current: dates.length, ratio: 1 }
  if (current === 0) return { current: 0, ratio: 0 }
  return { current, ratio: (t - values[current - 1]) / (values[current] - values[current - 1]) }
}
