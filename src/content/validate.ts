import type { EventKind, Faq, Generation, PlaceId, Project } from '@/domain/types'

/**
 * 콘텐츠 JSON 검사.
 * 모양이 틀린 줄은 화면에 내보내지 않고(사이트는 계속 뜸), 무엇이 틀렸는지 ContentIssue 로 남긴다.
 * content.test.ts 가 '틀린 줄 0개' 를 확인하므로, 잘못 고치면 npm test 가 바로 실패한다.
 */
export interface ContentIssue {
  file: string
  index: number
  id?: string
  problem: string
}

export interface Checked<T> {
  items: T[]
  issues: ContentIssue[]
}

type Raw = Record<string, unknown>

const PLACES: readonly PlaceId[] = ['about', 'projects', 'teams', 'community', 'recruits']
const KINDS: readonly EventKind[] = ['session', 'event', 'sprint', 'project', 'recruit', 'notice', 'rest']

const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

/** 실제로 있는 날짜인지까지 본다 ('2026-02-30' 은 틀림) */
export function isValidYmd(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

export function isValidYm(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(v)
}

export function isHttpsUrl(v: unknown): v is string {
  if (typeof v !== 'string') return false
  try {
    return new URL(v).protocol === 'https:'
  } catch {
    return false
  }
}

const isPositiveInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0
const isStringList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isText)

/** 줄마다 검사해서 통과한 줄만 모은다 */
function checkList<T>(file: string, list: unknown, check: (raw: Raw, problems: string[]) => T): Checked<T> {
  const items: T[] = []
  const issues: ContentIssue[] = []
  if (!Array.isArray(list)) {
    return { items, issues: [{ file, index: -1, problem: '목록(배열)이 아닙니다' }] }
  }
  list.forEach((raw, index) => {
    if (!isObject(raw)) {
      issues.push({ file, index, problem: '객체가 아닙니다' })
      return
    }
    const problems: string[] = []
    const item = check(raw, problems)
    const id = isText(raw.id) ? raw.id : undefined
    if (problems.length) problems.forEach((problem) => issues.push({ file, index, id, problem }))
    else items.push(item)
  })
  return { items, issues }
}

function requireText(raw: Raw, key: string, problems: string[]) {
  if (!isText(raw[key])) problems.push(`${key} 가 비어 있습니다`)
}

function optional(raw: Raw, key: string, ok: (v: unknown) => boolean, what: string, problems: string[]) {
  if (raw[key] !== undefined && !ok(raw[key])) problems.push(`${key} 는 ${what} 이어야 합니다`)
}

/** 출처: 공개 페이지 주소(https) 또는 내부 계획 이름('4기 운영 계획' 등) */
function requireSource(raw: Raw, problems: string[]) {
  const s = raw.source
  if (!isText(s)) problems.push('source(출처)가 없습니다')
  else if (/^https?:/.test(s) && !isHttpsUrl(s)) problems.push('source 주소가 https 가 아닙니다')
}

/** events.json 의 원래 줄 검사 (화면용 변환은 adaptList 가 맡는다) */
export function checkEvents(list: unknown): ContentIssue[] {
  return checkList('events.json', list, (raw, problems) => {
    requireText(raw, 'id', problems)
    requireText(raw, 'title', problems)
    if (!isValidYmd(raw.date)) problems.push('date 는 YYYY-MM-DD 이어야 합니다')
    optional(raw, 'endDate', isValidYmd, 'YYYY-MM-DD', problems)
    if (isValidYmd(raw.date) && isValidYmd(raw.endDate) && raw.endDate < raw.date) problems.push('endDate 가 date 보다 빠릅니다')
    if (!KINDS.includes(raw.kind as EventKind)) problems.push(`kind 는 ${KINDS.join(' | ')} 중 하나여야 합니다`)
    if (!PLACES.includes(raw.place as PlaceId)) problems.push(`place 는 ${PLACES.join(' | ')} 중 하나여야 합니다`)
    optional(raw, 'generation', isPositiveInt, '1 이상의 정수', problems)
    optional(raw, 'url', isHttpsUrl, 'https 주소', problems)
    for (const key of ['series', 'venue', 'originalTitle']) optional(raw, key, isText, '글자', problems)
    requireSource(raw, problems)
    return null
  }).issues
}

export function checkProjects(list: unknown): Checked<Project> {
  return checkList('projects.json', list, (raw, problems) => {
    for (const key of ['id', 'name', 'program']) requireText(raw, key, problems)
    if (!(typeof raw.year === 'number' && Number.isInteger(raw.year) && raw.year >= 2000 && raw.year <= 2100)) problems.push('year 는 네 자리 연도여야 합니다')
    if (raw.status !== 'done' && raw.status !== 'in-progress') problems.push("status 는 'done' | 'in-progress' 중 하나여야 합니다")
    optional(raw, 'generation', isPositiveInt, '1 이상의 정수', problems)
    optional(raw, 'summary', isText, '글자', problems)
    optional(raw, 'stack', (v) => isStringList(v) && v.length <= 4, '글자 목록(4개까지)', problems)
    optional(raw, 'repo', isHttpsUrl, 'https 주소', problems)
    optional(raw, 'url', isHttpsUrl, 'https 주소', problems)
    // 진행 중 프로젝트는 아직 공개 주소가 없을 수 있다 (예: 개인 저장소에서 만드는 중). 끝난 프로젝트는 꼭 있어야 한다
    if (raw.repo === undefined && raw.url === undefined && raw.status !== 'in-progress') problems.push('끝난 프로젝트는 repo 나 url 중 하나가 있어야 합니다')
    requireSource(raw, problems)
    if (problems.length) return null as never
    const p: Project = { id: raw.id as string, name: raw.name as string, program: raw.program as string, year: raw.year as number, status: raw.status as Project['status'] }
    if (raw.summary !== undefined) p.summary = raw.summary as string
    if (raw.generation !== undefined) p.generation = raw.generation as number
    if (raw.stack !== undefined) p.stack = [...(raw.stack as string[])]
    if (raw.repo !== undefined) p.repo = raw.repo as string
    if (raw.url !== undefined) p.url = raw.url as string
    p.source = raw.source as string
    return p
  })
}

export function checkGenerations(list: unknown): Checked<Generation> {
  return checkList('generations.json', list, (raw, problems) => {
    if (!isPositiveInt(raw.n)) problems.push('n 은 1 이상의 정수여야 합니다')
    requireText(raw, 'name', problems)
    requireText(raw, 'summary', problems)
    optional(raw, 'start', isValidYm, 'YYYY-MM', problems)
    optional(raw, 'end', isValidYm, 'YYYY-MM', problems)
    if (isValidYm(raw.start) && isValidYm(raw.end) && raw.end < raw.start) problems.push('end 가 start 보다 빠릅니다')
    if (!isStringList(raw.highlights) || raw.highlights.length < 1 || raw.highlights.length > 4) problems.push('highlights 는 1~4개의 글자 목록이어야 합니다')
    optional(raw, 'current', (v) => typeof v === 'boolean', 'true/false', problems)
    if (!isStringList(raw.source) || raw.source.length === 0) problems.push('source 는 출처 목록(1개 이상)이어야 합니다')
    else if (raw.source.some((s) => /^https?:/.test(s) && !isHttpsUrl(s))) problems.push('source 주소가 https 가 아닙니다')
    if (problems.length) return null as never
    const g: Generation = { n: raw.n as number, name: raw.name as string, summary: raw.summary as string, highlights: [...(raw.highlights as string[])], source: [...(raw.source as string[])] }
    if (raw.start !== undefined) g.start = raw.start as string
    if (raw.end !== undefined) g.end = raw.end as string
    if (raw.current !== undefined) g.current = raw.current as boolean
    return g
  })
}

export function checkFaqs(list: unknown): Checked<Faq> {
  return checkList('faq.json', list, (raw, problems) => {
    for (const key of ['id', 'q', 'a']) requireText(raw, key, problems)
    requireSource(raw, problems)
    return { id: raw.id as string, q: raw.q as string, a: raw.a as string, source: raw.source as string }
  })
}
