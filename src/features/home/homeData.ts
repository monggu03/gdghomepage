import type { Generation, Project, ScheduleEvent } from '@/domain/types'
import { monthDay, weekday } from '@/lib/date'

/**
 * 홈 화면 계산 (DOM 없음, homeData.test.ts 에 테스트).
 * 콘텐츠가 0건이어도, 행사가 60건 · 프로젝트가 20개를 넘어도 같은 코드로 그린다.
 * 날짜 표기는 docs/DESIGN.md 3장: '10.27 화', 해가 다르면 '2027.01.30 토'.
 */

const sameYear = (a: string, b: string) => a.slice(0, 4) === b.slice(0, 4)

/** '10.27 화' · 올해가 아니면 '2027.01.30 토' */
export function dayLabel(ymd: string, today: string): string {
  const md = sameYear(ymd, today) ? monthDay(ymd) : `${ymd.slice(0, 4)}.${monthDay(ymd)}`
  return `${md} ${weekday(ymd)}`
}

/** 요일 없이: '10.13' · '2027.01.30' */
export function shortDay(ymd: string, today: string): string {
  return sameYear(ymd, today) ? monthDay(ymd) : `${ymd.slice(0, 4)}.${monthDay(ymd)}`
}

/**
 * 기간: '10.13–12.29' · 같은 달 '2027.01.30–31' · 해를 넘기면 양쪽 모두 연도 '2026.11.02–2027.01.31'.
 * 하루짜리는 '10.27'.
 */
export function spanLabel(start: string, end: string | undefined, today: string): string {
  if (!end || end === start) return shortDay(start, today)
  if (!sameYear(start, end)) return `${start.slice(0, 4)}.${monthDay(start)}–${end.slice(0, 4)}.${monthDay(end)}`
  const head = shortDay(start, today)
  if (start.slice(0, 7) === end.slice(0, 7)) return `${head}–${end.slice(8, 10)}`
  return `${head}–${monthDay(end)}`
}

/** 문장 단위로 나눈다: 넓은 화면에서 문장마다 줄을 바꿔 뜻으로 끊기 위해 */
export const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean)

/** 'YYYY-MM' → 'YYYY.MM' */
export const dotMonth = (ym: string) => ym.slice(0, 7).replace('-', '.')

/** 행사가 끝난 날 (여러 날 행사는 마지막 날) */
const endOf = (e: Pick<ScheduleEvent, 'date' | 'endDate'>) => e.endDate ?? e.date

const byDate = (a: ScheduleEvent, b: ScheduleEvent) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'ko')

/** 오늘 이후(오늘 포함) 첫 일정. 휴회는 일정이 아니므로 뺀다 */
export function nextEvent(
  events: readonly ScheduleEvent[],
  today: string,
  match: (e: ScheduleEvent) => boolean = () => true,
): ScheduleEvent | null {
  return [...events].filter((e) => endOf(e) >= today && e.kind !== 'rest' && match(e)).sort(byDate)[0] ?? null
}

/**
 * 글자 표지에 적을 일정 n개: 다가오는 일정을 먼저 채우고, 모자라면 가장 최근에 끝난 일정으로 채운다.
 * 한 기수에 일정이 수십 개여도 표지에는 오늘과 가까운 n개만 날짜순으로.
 */
export function coverRows(events: readonly ScheduleEvent[], today: string, match: (e: ScheduleEvent) => boolean, n = 4): ScheduleEvent[] {
  const list = events.filter((e) => e.kind !== 'rest' && match(e))
  const upcoming = list.filter((e) => endOf(e) >= today).sort(byDate)
  const past = list.filter((e) => endOf(e) < today).sort((a, b) => byDate(b, a))
  const picked = [...upcoming.slice(0, n), ...past.slice(0, Math.max(0, n - upcoming.length))]
  return picked.sort(byDate)
}

/** 맞는 일정들의 처음 ~ 끝 날짜. 없으면 null */
export function eventSpan(events: readonly ScheduleEvent[], match: (e: ScheduleEvent) => boolean): { start: string; end: string } | null {
  const list = events.filter((e) => e.kind !== 'rest' && match(e))
  if (list.length === 0) return null
  return {
    start: list.reduce((m, e) => (e.date < m ? e.date : m), list[0].date),
    end: list.reduce((m, e) => (endOf(e) > m ? endOf(e) : m), endOf(list[0])),
  }
}

const text = (e: ScheduleEvent) => [e.title, e.originalTitle, e.series].filter(Boolean).join(' ')

/**
 * 다른 학교 · 챕터와 함께 여는 행사 (동홍동락, 동지톤, 합동 세미나, Inter-Chapter, 연합 컨퍼런스 등).
 * '컨퍼런스' 만으로는 고르지 않는다: 동국대 Dev Conference 처럼 우리끼리 여는 행사도 있다.
 */
const JOINT = /동홍동락|동지톤|연합|합동|교류전|해커톤|hackathon|inter-?chapter/i
export const isJointEvent = (e: ScheduleEvent) => e.kind === 'event' && JOINT.test(text(e))

export const isSprintEvent = (e: ScheduleEvent) => e.kind === 'sprint' || /g-?sprint/i.test(text(e))

export const isSessionEvent = (e: ScheduleEvent) => e.kind === 'session'

/** gdg.community.dev 에 올라간 지난 행사 수 (휴회 제외) */
export function pastPublishedCount(events: readonly ScheduleEvent[], today: string): number {
  return events.filter((e) => e.kind !== 'rest' && endOf(e) < today && (e.source ?? '').includes('gdg.community.dev')).length
}

/** 끝난 연합 행사, 최근 것부터 */
export function pastJointEvents(events: readonly ScheduleEvent[], today: string): ScheduleEvent[] {
  return events.filter((e) => isJointEvent(e) && endOf(e) < today).sort((a, b) => byDate(b, a))
}

/** GitHub 저장소가 있는 프로젝트 수 */
export const projectsWithRepo = (projects: readonly Project[]) => projects.filter((p) => Boolean(p.repo)).length

const recent = (a: Project, b: Project) => b.year - a.year || (b.generation ?? 0) - (a.generation ?? 0) || a.name.localeCompare(b.name, 'ko')

/**
 * 최근 프로젝트 limit 개: 한 줄 설명이 있는 것을 먼저 고르고, 모자라면 설명 없는 것으로 채운다.
 * 고른 것은 해 → 기수 → 이름 순. 진행 중인 것은 데모데이 전이라 뺀다
 */
export function latestProjects(projects: readonly Project[], limit: number): Project[] {
  const done = projects.filter((p) => p.status === 'done').sort(recent)
  const described = done.filter((p) => p.summary?.trim())
  const bare = done.filter((p) => !p.summary?.trim())
  return [...described, ...bare].slice(0, limit).sort(recent)
}

/** 프로젝트 카드 위 한 줄: 'Solution Challenge · 2024 · 2기' (프로그램 이름에 해가 이미 있으면 한 번만) */
export function projectMeta(p: Pick<Project, 'program' | 'year' | 'generation'>): string {
  const parts = [p.program]
  if (!p.program.includes(String(p.year))) parts.push(String(p.year))
  if (p.generation) parts.push(`${p.generation}기`)
  return parts.join(' · ')
}

/**
 * 기수 기간: '2022.09–2023.08' · 지금 기수는 '2026.09–'.
 * 공개 기록으로 시작 달을 모르면 끝 달만 ('–2023.08'), 둘 다 모르면 빈 글자 (화면에서 숨김).
 */
export function generationPeriod(g: Pick<Generation, 'start' | 'end'>): string {
  if (!g.start && !g.end) return ''
  return `${g.start ? dotMonth(g.start) : ''}–${g.end ? dotMonth(g.end) : ''}`
}

/** 연혁은 오래된 기수부터 */
export const sortGenerations = (gens: readonly Generation[]) => [...gens].sort((a, b) => a.n - b.n)

/** '그룹 멤버 244명' 의 기준: 'gdg.community.dev 기준 2026.10' */
export function membersBasis(asOf: string): string {
  return `gdg.community.dev 기준 ${dotMonth(asOf)}`
}

/** 받침이 있으면 '을', 없으면 '를' (한글이 아니면 '를') */
function objectJosa(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? '을' : '를'
}

/** 모집 시기를 말로: 한 달 안 1–10일이면 '9월 초', 21일부터면 '8월 말', 그 밖은 '8월'. 달을 넘기면 '8–9월' */
export function monthWords(start: string, end: string = start): string {
  const m = +start.slice(5, 7)
  if (start.slice(0, 7) !== end.slice(0, 7)) return `${m}–${+end.slice(5, 7)}월`
  if (+end.slice(8, 10) <= 10) return `${m}월 초`
  if (+start.slice(8, 10) >= 21) return `${m}월 말`
  return `${m}월`
}

/**
 * 지난 모집 한 줄: '지난 4기는 8월에 코어 멤버, 9월 초에 마케팅 코어 · 일반 멤버를 모집했습니다.'
 * 기간이 있는 단계(모집)만 쓰고 (OT 처럼 하루짜리는 뺀다), 같은 시기의 단계는 한 묶음으로. 쓸 단계가 없으면 null
 */
export function pastRecruitLine(generation: number, steps: readonly { label: string; start: string; end?: string }[]): string | null {
  const groups: { when: string; who: string[] }[] = []
  for (const st of steps) {
    if (!st.end) continue
    const when = monthWords(st.start, st.end)
    const who = st.label.replace(/\s*모집$/, '')
    const prev = groups[groups.length - 1]
    if (prev?.when === when) prev.who.push(who)
    else groups.push({ when, who: [who] })
  }
  if (groups.length === 0) return null
  const tail = groups[groups.length - 1].who
  const parts = groups.map((g) => `${g.when}에 ${g.who.join(' · ')}`).join(', ')
  return `지난 ${generation}기는 ${parts}${objectJosa(tail[tail.length - 1])} 모집했습니다.`
}
