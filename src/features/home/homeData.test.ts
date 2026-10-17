import { describe, expect, it } from 'vitest'
import type { Generation, Project, ScheduleEvent } from '@/domain/types'
import {
  coverRows,
  dayLabel,
  eventSpan,
  generationPeriod,
  isJointEvent,
  latestProjects,
  membersBasis,
  monthWords,
  nextEvent,
  pastJointEvents,
  pastPublishedCount,
  projectMeta,
  projectsWithRepo,
  pastRecruitLine,
  sentences,
  shortDay,
  sortGenerations,
  spanLabel,
} from './homeData'

const ev = (id: string, date: string, kind: ScheduleEvent['kind'], extra: Partial<ScheduleEvent> = {}): ScheduleEvent => ({
  id,
  date,
  title: id,
  kind,
  place: 'community',
  ...extra,
})

const TODAY = '2026-10-17'

describe('날짜 표기', () => {
  it("올해는 '10.27 화', 다른 해는 연도를 붙인다", () => {
    expect(dayLabel('2026-10-27', TODAY)).toBe('10.27 화')
    expect(dayLabel('2027-01-30', TODAY)).toBe('2027.01.30 토')
    expect(shortDay('2027-01-30', TODAY)).toBe('2027.01.30')
  })

  it('기간은 같은 달 · 다른 달 · 다른 해를 나눈다', () => {
    expect(spanLabel('2026-10-13', '2026-12-29', TODAY)).toBe('10.13–12.29')
    expect(spanLabel('2027-01-30', '2027-01-31', TODAY)).toBe('2027.01.30–31')
    expect(spanLabel('2026-11-02', '2027-01-31', TODAY)).toBe('2026.11.02–2027.01.31')
    expect(spanLabel('2026-10-27', undefined, TODAY)).toBe('10.27')
  })
})

describe('문장 나누기', () => {
  it('마침표 뒤에서 나눈다 (2026–27 같은 숫자는 그대로)', () => {
    expect(sentences('4기(2026–27)입니다. 전공과 학년에 상관없이 함께합니다.')).toEqual(['4기(2026–27)입니다.', '전공과 학년에 상관없이 함께합니다.'])
    expect(sentences('')).toEqual([])
  })
})

describe('다음 일정', () => {
  const events = [
    ev('rest', '2026-10-20', 'rest'),
    ev('mid', '2026-10-27', 'sprint'),
    ev('past', '2026-10-13', 'sprint'),
    ev('dhdr', '2026-11-02', 'event', { title: '동홍동락 1차' }),
    ev('thon', '2027-01-30', 'event', { title: '동지톤', endDate: '2027-01-31' }),
  ]

  it('휴회와 지난 일정을 건너뛴다', () => {
    expect(nextEvent(events, TODAY)?.id).toBe('mid')
  })

  it('조건에 맞는 첫 일정을 고른다', () => {
    expect(nextEvent(events, TODAY, isJointEvent)?.id).toBe('dhdr')
  })

  it('여러 날 행사는 끝나는 날까지 다가오는 일정이다', () => {
    expect(nextEvent(events, '2027-01-31')?.id).toBe('thon')
  })

  it('일정이 없으면 null', () => {
    expect(nextEvent([], TODAY)).toBeNull()
  })

  it('기간은 맞는 일정의 처음과 끝', () => {
    expect(eventSpan(events, isJointEvent)).toEqual({ start: '2026-11-02', end: '2027-01-31' })
    expect(eventSpan([], isJointEvent)).toBeNull()
  })
})

describe('글자 표지 일정', () => {
  const all = () => true
  it('다가오는 일정을 먼저, 모자라면 최근 지난 일정으로 채워 날짜순으로', () => {
    const list = [ev('a', '2026-09-01', 'session'), ev('b', '2026-09-22', 'session'), ev('c', '2026-10-27', 'session'), ev('d', '2026-12-01', 'session'), ev('r', '2026-10-20', 'rest')]
    expect(coverRows(list, TODAY, all, 3).map((e) => e.id)).toEqual(['b', 'c', 'd'])
  })
  it('일정이 많아도 n개', () => {
    const many = Array.from({ length: 64 }, (_, i) => ev(`e${i}`, `2026-${String((i % 12) + 1).padStart(2, '0')}-10`, 'session'))
    expect(coverRows(many, TODAY, all, 4)).toHaveLength(4)
    expect(coverRows([], TODAY, all, 4)).toEqual([])
  })
})

describe('연합 행사 · 지난 행사 수', () => {
  it('MT 같은 일반 행사는 연합 행사가 아니다', () => {
    expect(isJointEvent(ev('mt', '2026-12-15', 'event', { title: 'MT' }))).toBe(false)
    expect(isJointEvent(ev('ics', '2024-05-01', 'event', { title: '연합 세션', originalTitle: 'Inter-Chapter Session' }))).toBe(true)
    expect(isJointEvent(ev('s', '2024-05-01', 'session', { title: '동홍동락 준비' }))).toBe(false)
  })

  it("합동 세미나는 연합 행사, 우리끼리 여는 '컨퍼런스'는 아니다", () => {
    expect(isJointEvent(ev('hs', '2024-11-07', 'event', { title: '홍익대 합동 세미나' }))).toBe(true)
    expect(isJointEvent(ev('dc', '2025-11-06', 'event', { title: '동국대 Dev Conference 2025', originalTitle: 'Dongguk University Dev Conference 2025' }))).toBe(false)
  })

  it('끝난 연합 행사를 최근 것부터', () => {
    const list = [
      ev('a', '2024-05-01', 'event', { title: '홍익대 합동 세미나' }),
      ev('b', '2025-03-01', 'event', { title: 'Inter-Chapter Session' }),
      ev('c', '2026-11-02', 'event', { title: '동홍동락 1차' }),
    ]
    expect(pastJointEvents(list, TODAY).map((e) => e.id)).toEqual(['b', 'a'])
  })

  it('gdg.community.dev 출처의 지난 행사만 센다', () => {
    const src = 'https://gdg.community.dev/gdg-on-campus-dongguk-university-seoul-south-korea/'
    const list = [
      ev('a', '2026-09-15', 'recruit', { source: src }),
      ev('b', '2026-10-13', 'sprint', { source: src }),
      ev('c', '2026-10-27', 'sprint', { source: '4기 운영 계획' }),
      ev('d', '2026-12-01', 'session', { source: src }),
      ev('e', '2026-10-06', 'rest', { source: src }),
    ]
    expect(pastPublishedCount(list, TODAY)).toBe(2)
    expect(pastPublishedCount([], TODAY)).toBe(0)
  })
})

describe('프로젝트', () => {
  const p = (id: string, year: number, extra: Partial<Project> = {}): Project => ({ id, name: id, program: 'G-Sprint', year, status: 'done', ...extra })

  it('최근 것부터, 진행 중은 빼고, 개수를 자른다', () => {
    const list = [p('a', 2023), p('b', 2025, { generation: 3 }), p('c', 2025, { generation: 2 }), p('d', 2026, { status: 'in-progress' })]
    expect(latestProjects(list, 2).map((x) => x.id)).toEqual(['b', 'c'])
    expect(latestProjects(Array.from({ length: 24 }, (_, i) => p(`x${i}`, 2020 + (i % 5))), 6)).toHaveLength(6)
  })

  it('한 줄 설명이 있는 것을 먼저 고른다 (고른 뒤에는 최근 순)', () => {
    const list = [p('new', 2026), p('old', 2024, { summary: '설명' }), p('mid', 2025, { summary: '설명' })]
    expect(latestProjects(list, 2).map((x) => x.id)).toEqual(['mid', 'old'])
    expect(latestProjects(list, 3).map((x) => x.id)).toEqual(['new', 'mid', 'old'])
  })

  it('저장소가 있는 것만 센다', () => {
    expect(projectsWithRepo([p('a', 2024, { repo: 'https://github.com/GDSC-DGU/a' }), p('b', 2024)])).toBe(1)
  })

  it('프로그램 이름에 해가 있으면 해를 두 번 쓰지 않는다', () => {
    expect(projectMeta({ program: 'Solution Challenge 2024', year: 2024, generation: 2 })).toBe('Solution Challenge 2024 · 2기')
    expect(projectMeta({ program: 'G-Sprint', year: 2026 })).toBe('G-Sprint · 2026')
  })
})

describe('연혁', () => {
  const g = (n: number, start?: string, end?: string): Generation => ({ n, name: 'GDSC DGU', start, end, summary: '', highlights: [], source: [] })

  it('기간과 순서', () => {
    expect(generationPeriod(g(1, '2022-09', '2023-08'))).toBe('2022.09–2023.08')
    expect(generationPeriod(g(4, '2026-09'))).toBe('2026.09–')
    expect(generationPeriod({ end: '2023-06' })).toBe('–2023.06')
    expect(generationPeriod({})).toBe('')
    expect(sortGenerations([g(3, '2024-09'), g(1, '2022-09')]).map((x) => x.n)).toEqual([1, 3])
  })

  it('멤버 수의 기준', () => {
    expect(membersBasis('2026-10-16')).toBe('gdg.community.dev 기준 2026.10')
  })
})

describe('지난 모집 한 줄', () => {
  it('초 · 말 · 달만', () => {
    expect(monthWords('2026-09-03', '2026-09-10')).toBe('9월 초')
    expect(monthWords('2026-08-18', '2026-08-31')).toBe('8월')
    expect(monthWords('2026-08-21', '2026-08-31')).toBe('8월 말')
    expect(monthWords('2026-08-25', '2026-09-05')).toBe('8–9월')
  })

  it('기간이 있는 단계만 쓰고, 없으면 null', () => {
    const steps = [
      { label: '코어 멤버 모집', start: '2026-08-18', end: '2026-08-31' },
      { label: '일반 멤버 모집', start: '2026-09-03', end: '2026-09-10' },
      { label: '4기 OT', start: '2026-09-15' },
    ]
    expect(pastRecruitLine(4, steps)).toBe('지난 4기는 8월에 코어 멤버, 9월 초에 일반 멤버를 모집했습니다.')
    const withMarketing = [steps[0], { label: '마케팅 코어 모집', start: '2026-09-02', end: '2026-09-09' }, steps[1], steps[2]]
    expect(pastRecruitLine(4, withMarketing)).toBe('지난 4기는 8월에 코어 멤버, 9월 초에 마케팅 코어 · 일반 멤버를 모집했습니다.')
    expect(pastRecruitLine(4, [{ label: '4기 OT', start: '2026-09-15' }])).toBeNull()
  })
})
