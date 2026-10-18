import type { ScheduleEvent } from '@/domain/types'
import { dayValue } from '@/lib/date'

/**
 * '세 기수의 1년' 달력 계산 (기수마다 9월에 시작하는 1년을 한 줄로). heatmap.test.ts 에 테스트.
 * 칸 = 하루, 세로 = 요일(월–일), 가로 = 주. 폰에서는 주 하나를 칸 하나로 줄인 띠로 그린다.
 */

const DAY = 86_400_000
const ymdOf = (v: number) => new Date(v).toISOString().slice(0, 10)

/** 한 줄의 주 수: 9월 1일이 든 주부터 다음 해 8월 31일이 든 주까지 */
export const WEEKS = 53

/** 그 학년(9월 시작) 달력의 첫 칸: 9월 1일이 든 주의 월요일 */
export function yearOrigin(startYear: number): string {
  const sep1 = dayValue(`${startYear}-09-01`)
  const monIndex = (new Date(sep1).getUTCDay() + 6) % 7
  return ymdOf(sep1 - monIndex * DAY)
}

/** 날짜 → 칸 자리 (week: 0…52, row: 0 = 월 … 6 = 일) */
export function cellOf(ymd: string, origin: string): { week: number; row: number } {
  const days = Math.round((dayValue(ymd) - dayValue(origin)) / DAY)
  return { week: Math.floor(days / 7), row: ((days % 7) + 7) % 7 }
}

/** 칸 자리 → 날짜 */
export const dayAt = (origin: string, week: number, row: number) => ymdOf(dayValue(origin) + (week * 7 + row) * DAY)

/** 9월 … 8월 이름이 놓일 주 */
export function monthColumns(startYear: number): { month: number; week: number }[] {
  const origin = yearOrigin(startYear)
  return [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8].map((m) => {
    const y = m >= 9 ? startYear : startYear + 1
    return { month: m, week: cellOf(`${y}-${String(m).padStart(2, '0')}-01`, origin).week }
  })
}

/** 'YYYY-MM' → 그 학년이 시작한 해 (9월 시작). 2025-03 → 2024 */
export function academicYear(ym: string): number {
  const y = +ym.slice(0, 4)
  return +ym.slice(5, 7) >= 9 ? y : y - 1
}

/**
 * 같은 날 일정이 여럿이면 칸에 칠할 하나: 휴회보다 일정, 일정 중에는 대표 행사(G-Sprint · 데모데이 · 연합 행사) 먼저.
 */
const RANK: Record<ScheduleEvent['kind'], number> = { sprint: 0, project: 0, event: 1, recruit: 2, session: 3, notice: 4, rest: 5 }
export function cellEvent<T extends Pick<ScheduleEvent, 'kind'>>(list: readonly T[]): T | undefined {
  return [...list].sort((a, b) => RANK[a.kind] - RANK[b.kind])[0]
}

/** 날짜별 일정 (여러 날 행사는 날마다) */
export function eventsByDay<T extends Pick<ScheduleEvent, 'date' | 'endDate'>>(events: readonly T[]): Map<string, T[]> {
  const m = new Map<string, T[]>()
  for (const e of events) {
    for (let v = dayValue(e.date); v <= dayValue(e.endDate ?? e.date); v += DAY) {
      const k = ymdOf(v)
      m.set(k, [...(m.get(k) ?? []), e])
    }
  }
  return m
}

/**
 * 누른 자리에서 가장 가까운 일정 칸 (가로 · 세로 칸 단위 거리). 손가락으로 6px 칸을 정확히 누를 수 없어서다.
 * cells: 일정이 있는 칸들. 없으면 null.
 */
export function nearestCell<T extends { week: number; row: number }>(cells: readonly T[], week: number, row: number): T | null {
  let best: T | null = null
  let dist = Infinity
  for (const c of cells) {
    const d = (c.week - week) ** 2 + (c.row - row) ** 2
    if (d < dist) {
      best = c
      dist = d
    }
  }
  return best
}

/* ── 기수 한 줄 (YearHeatmap 이 그리고, CommunityPage 가 제목 숫자를 센다) ── */

/** 칸 하나: 하루(days) 또는 한 주(weeks, 폰 띠) */
export interface YearCell<T extends ScheduleEvent = ScheduleEvent> {
  /** 칸 id 의 끝부분 · 고른 칸 비교용 ('2025-11-06' 또는 'w9') */
  key: string
  week: number
  row: number
  /** 칸에 든 일정 (날짜순) */
  events: T[]
  /** 칸에 칠할 하나 */
  main: T
}

export interface YearRow<G extends { n: number; start?: string | null } = { n: number; start?: string | null }> {
  gen: G
  /** 이 기수 달력의 첫 칸 (9월 1일이 든 주의 월요일) */
  origin: string
  days: YearCell[]
  weeks: YearCell[]
  /** 끝난 공개 행사 수 (휴회 제외) */
  past: number
  /** 앞으로의 일정 수 (휴회 제외) */
  plan: number
}

const endOfEvent = (e: Pick<ScheduleEvent, 'date' | 'endDate'>) => e.endDate ?? e.date

/**
 * 기수마다 9월에 시작하는 1년 한 줄. 시작 달을 모르는 기수와 칸이 하나도 없는 기수(공개 기록 없음)는 뺀다.
 * 오래된 기수부터. 화면 제목('세 기수가 연 공개 행사 45번')의 숫자는 past 를 더한 것이다.
 */
export function yearRows<G extends { n: number; start?: string | null }>(gens: readonly G[], events: readonly ScheduleEvent[], today: string): YearRow<G>[] {
  return gens
    .filter((g) => g.start)
    .sort((a, b) => a.n - b.n)
    .map((gen) => {
      const origin = yearOrigin(academicYear(gen.start ?? '2000-09'))
      const list = events.filter((e) => e.generation === gen.n)
      const days: YearCell[] = [...eventsByDay(list).entries()]
        .map(([ymd, evs]) => ({ key: ymd, ...cellOf(ymd, origin), events: evs, main: cellEvent(evs)! }))
        .filter((d) => d.week >= 0 && d.week < WEEKS)
        .sort((a, b) => a.key.localeCompare(b.key))
      const byWeek = new Map<number, ScheduleEvent[]>()
      for (const d of days) {
        const prev = byWeek.get(d.week) ?? []
        byWeek.set(d.week, [...prev, ...d.events.filter((e) => !prev.includes(e))])
      }
      const weeks: YearCell[] = [...byWeek.entries()]
        .map(([week, evs]) => ({ key: `w${week}`, week, row: 0, events: evs, main: cellEvent(evs)! }))
        .sort((a, b) => a.week - b.week)
      const real = list.filter((e) => e.kind !== 'rest')
      return {
        gen,
        origin,
        days,
        weeks,
        past: real.filter((e) => endOfEvent(e) < today).length,
        plan: real.filter((e) => endOfEvent(e) >= today).length,
      }
    })
    .filter((r) => r.days.length > 0)
}

/** 기수 수를 한글 낱말로 ('세 기수') */
const COUNT_WORD = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉']
export const countWord = (n: number) => COUNT_WORD[n] ?? String(n)
