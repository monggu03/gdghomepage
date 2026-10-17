import { dayValue } from '@/lib/date'

/**
 * 날짜 줄 계산 (지원 안내의 '지난 모집', 프로젝트의 G-Sprint 단계).
 * timeline.test.ts 에 테스트.
 */

export type StepState = 'done' | 'next' | 'later'

/**
 * 단계마다 상태: 날짜가 오늘이거나 지났으면 done, 그 다음 하나는 next, 나머지는 later.
 * 날짜를 모르는 단계(null)는 앞 단계를 따라간다.
 */
export function stepStates(dates: readonly (string | null)[], today: string): StepState[] {
  let nextGiven = false
  return dates.map((d) => {
    if (d !== null && d <= today) return 'done'
    if (!nextGiven) {
      nextGiven = true
      return 'next'
    }
    return 'later'
  })
}

export interface Span {
  id: string
  start: string
  /** 하루짜리는 비움 */
  end?: string
}

export interface SpanBox {
  id: string
  /** 축 왼쪽 끝에서 % */
  left: number
  /** % (하루짜리도 하루 폭) */
  width: number
  /** 겹치는 기간은 위 줄로 올린다. 0 = 축 바로 위 */
  lane: number
}

export interface MonthTick {
  /** '9월' */
  label: string
  left: number
}

/**
 * 기간들을 한 축 위에 놓는다. 축은 첫 시작일 0시부터 마지막 날 24시까지, 날 수에 비례.
 * 날짜가 겹치는 기간은 위 줄(lane)로 올려 막대와 이름이 겹치지 않게 한다.
 * 축 안에 들어오는 매달 1일에 눈금을 둔다.
 */
export function layoutSpans(spans: readonly Span[]): { boxes: SpanBox[]; months: MonthTick[]; days: number; lanes: number } {
  if (spans.length === 0) return { boxes: [], months: [], days: 0, lanes: 0 }
  const DAY = 86_400_000
  const from = Math.min(...spans.map((s) => dayValue(s.start)))
  const to = Math.max(...spans.map((s) => dayValue(s.end ?? s.start))) + DAY
  const total = to - from
  const pct = (ms: number) => Math.round(((ms - from) / total) * 10_000) / 100
  // 줄마다 마지막 기간이 끝나는 때. 시작이 빠른 것부터 비어 있는 가장 낮은 줄에 놓는다
  const laneEnds: number[] = []
  const laneOf = new Map<Span, number>()
  for (const s of [...spans].sort((x, y) => dayValue(x.start) - dayValue(y.start))) {
    const a = dayValue(s.start)
    let lane = laneEnds.findIndex((end) => end <= a)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = dayValue(s.end ?? s.start) + DAY
    laneOf.set(s, lane)
  }
  const boxes = spans.map((s) => {
    const a = dayValue(s.start)
    const b = dayValue(s.end ?? s.start) + DAY
    return { id: s.id, left: pct(a), width: Math.round(((b - a) / total) * 10_000) / 100, lane: laneOf.get(s) ?? 0 }
  })
  const months: MonthTick[] = []
  const d = new Date(from)
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + 1)
  for (; d.getTime() < to; d.setUTCMonth(d.getUTCMonth() + 1)) {
    months.push({ label: `${d.getUTCMonth() + 1}월`, left: pct(d.getTime()) })
  }
  return { boxes, months, days: Math.round(total / DAY), lanes: laneEnds.length }
}
