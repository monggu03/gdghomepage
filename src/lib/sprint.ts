import { dayValue } from './date'

/**
 * 지금 몇 번째 단계인지와, 이전 단계에서 얼마나 왔는지 (0~1).
 * 단계 날짜 당일은 그 단계가 '지금'이다 (막대가 그 단계까지 차고, 체크 표시는 다음 날부터).
 */
export function sprintProgress(dates: readonly string[], today: string): { current: number; ratio: number } {
  const t = dayValue(today)
  const values = dates.map(dayValue)
  const current = values.findIndex((v) => v >= t)
  if (current === -1) return { current: dates.length, ratio: 1 }
  if (current === 0) return { current: 0, ratio: values[0] === t ? 1 : 0 }
  return { current, ratio: (t - values[current - 1]) / (values[current] - values[current - 1]) }
}
