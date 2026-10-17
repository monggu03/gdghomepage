import { useId, useMemo, useState } from 'react'
import { CHAPTER } from '@/content'
import { SITE, SPRINT } from '@/config/site'
import { useSchedule } from '@/data/queries'
import type { ScheduleEvent } from '@/domain/types'
import { useToday } from '@/hooks/useToday'
import { monthDay } from '@/lib/date'
import { eventsInPeriod, progressCount, railPeriod, sprintWindow, type Period } from '@/lib/rail'
import { MonthCalendar } from './MonthCalendar'
import { SemesterRail } from './SemesterRail'
import { UpcomingList } from './UpcomingList'
import s from './now.module.css'

const NO_EVENTS: ScheduleEvent[] = []

/** '9월부터 2월까지' (해가 바뀌어도 달만: 레일 아래에 연도가 있다) */
const periodWords = (p: Period) => `${+p.start.slice(5, 7)}월부터 ${+p.end.slice(5, 7)}월까지`

/** 기준: 공개 페이지 주소는 도메인만, 나머지('4기 운영 계획')는 그대로 */
function sourceWords(events: readonly ScheduleEvent[]): string {
  const names = new Set<string>()
  for (const e of events) {
    if (!e.source) continue
    try {
      names.add(/^https?:/.test(e.source) ? new URL(e.source).hostname : e.source)
    } catch {
      names.add(e.source)
    }
  }
  return [...names].join(' · ')
}

/** 머리 한 줄: 이 기간 일정 가운데 몇 개를 마쳤는지 */
function progressLine(p: Period, events: readonly ScheduleEvent[], today: string): string {
  const { done, total } = progressCount(events, today)
  const span = periodWords(p)
  if (total === 0) return `${span} 등록된 일정이 아직 없습니다.`
  if (done === 0) return `${span} 일정 ${total}개가 잡혀 있습니다.`
  if (done === total) return `${span} 일정 ${total}개를 모두 마쳤습니다.`
  return `${span} 일정 ${total}개 가운데 ${done}개를 마쳤습니다.`
}

interface Props {
  /** 미리보기 · 테스트용 날짜 (기본은 오늘, 한국 시간) */
  today?: string
}

/**
 * 홈 '지금 4기는' 섹션: 학기 레일 · G-Sprint 한 줄 · 다가오는 일정 · 달력(펼침).
 * 데스크톱은 12칸 격자에서 머리 3칸 · 내용 9칸, 1279px 이하는 위아래로 쌓는다.
 * 바깥 여백(.container)과 섹션 사이 간격은 홈 페이지가 정한다.
 */
export function NowSection({ today: fixedToday }: Props) {
  const liveToday = useToday()
  const today = fixedToday ?? liveToday
  const calId = useId()
  const { data, isPending, isError } = useSchedule()
  const events = data ?? NO_EVENTS
  const status = isError && !data ? 'error' : isPending ? 'pending' : 'ready'

  const period = useMemo(() => railPeriod(events, today), [events, today])
  const inRail = useMemo(() => eventsInPeriod(events, period), [events, period])
  const sprint = useMemo(
    () =>
      sprintWindow(
        SPRINT.steps.map((st) => ({ label: st.label, date: st.date })),
        SPRINT.demoDay,
        inRail,
      ),
    [inRail],
  )
  const [pointed, setPointed] = useState<string | null>(null)
  const [calOpen, setCalOpen] = useState(false)
  const sources = sourceWords(inRail)
  const team = CHAPTER.sprint.verified && CHAPTER.sprint.generation === +SITE.generation.replace(/\D/g, '') ? CHAPTER.sprint : null

  return (
    <section id="now" className={s.root} aria-labelledby="now-title">
      <div className={s.head}>
        <h2 id="now-title" className={s.title}>
          지금 {SITE.generation}는
        </h2>
        {/* 불러오는 중 · 실패 안내는 아래 목록이 맡는다. 여기는 한 줄 자리만 지킨다 */}
        <p className={s.lede} aria-hidden={status !== 'ready' || undefined}>
          {status === 'ready' ? progressLine(period, inRail, today) : '\u00a0'}
        </p>
        {sources && <p className={s.basis}>{sources} 기준</p>}
      </div>

      <div className={s.body}>
        <SemesterRail period={period} events={inRail} today={today} sprint={sprint} linkedId={pointed} />

        {sprint && (
          <p className={s.sprint}>
            <span className={s.sg}>
              <i className={s.swatch} aria-hidden="true" />
              <b>{SPRINT.title}</b>
            </span>
            {/* D-n 은 첫 화면 '다음 일정' 하나만 (한 화면에 D-숫자 하나) */}
            <span className={s.sg}>
              <span className="num">{monthDay(sprint.start)}</span> 킥오프<span className="visually-hidden">부터</span>
              <span className={s.dash} aria-hidden="true">
                –
              </span>
              <span className="num">{monthDay(sprint.end)}</span> 데모데이
            </span>
            {team && (
              <span className={s.sg}>
                <span className="num">{team.teams}</span>팀 <span className="num">{team.members}</span>명
              </span>
            )}
          </p>
        )}

        <UpcomingList events={events} today={today} status={status} onPoint={setPointed} />

        <button type="button" className={s.toggle} aria-expanded={calOpen} aria-controls={calId} onClick={() => setCalOpen((o) => !o)}>
          {calOpen ? '달력 접기' : '달력으로 보기'}
          <svg className={s.toggleIcon} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div id={calId} className={s.calWrap} hidden={!calOpen}>
          {calOpen && <MonthCalendar id={`${calId}-cal`} events={events} today={today} />}
        </div>
      </div>
    </section>
  )
}
