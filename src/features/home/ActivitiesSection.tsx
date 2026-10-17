import { Link } from 'react-router-dom'
import { SITE } from '@/config/site'
import { CHAPTER } from '@/content'
import { useSchedule } from '@/data/queries'
import type { ScheduleEvent } from '@/domain/types'
import { useToday } from '@/hooks/useToday'
import { coverRows, dayLabel, eventSpan, isJointEvent, isSessionEvent, isSprintEvent, nextEvent, pastJointEvents, shortDay, spanLabel } from './homeData'
import { Section } from './Section'
import s from './sections.module.css'

const GEN = 4
const thisGen = (e: ScheduleEvent) => e.generation === GEN
const sprint = CHAPTER.sprint?.verified ? CHAPTER.sprint : null

interface Activity {
  id: string
  title: string
  /** 2–3줄, 확인된 사실만 (자주 묻는 질문 · 4기 운영 계획과 같은 말) */
  body: string
  /** 기간이 일정에서 나오지 않을 때 (예: 매주 화요일) */
  period?: string
  method: string
  /** 확인된 규모 (출처가 있을 때만) */
  scale?: string
  /** 이 활동의 일정 */
  match: (e: ScheduleEvent) => boolean
  /** 일정 제목에서 뺄 말머리 */
  strip?: RegExp
  /** 표지에 장소를 적는지 (학교를 오가는 행사만) */
  venue?: boolean
  link: { to: string; label: string }
}

const ACTIVITIES: Activity[] = [
  {
    id: 'sprint',
    title: 'G-Sprint',
    body: '4기의 대표 팀 프로젝트입니다. 팀마다 아이디어부터 배포까지 실제 서비스를 만들고, Google 기술을 하나 이상 씁니다. 결과는 데모데이(성과공유회)에서 공유합니다.',
    method: '팀 프로젝트 · 실제 배포',
    scale: sprint ? `${sprint.teams}팀 ${sprint.members}명` : undefined,
    match: (e) => thisGen(e) && isSprintEvent(e),
    strip: /^G-?Sprint\s*/i,
    link: { to: '/projects', label: '프로젝트 기록 보기' },
  },
  {
    id: 'sessions',
    title: '화요일 세션',
    body: '화요일마다 정기 세션을 엽니다. Frontend · Backend · AI/ML · Product Design 네 파트의 코어 멤버가 세션을 이끌고, 중간 · 기말고사 기간에는 쉽니다.',
    period: '매주 화요일',
    method: '파트별 실습 · 현업자 세미나',
    match: (e) => thisGen(e) && isSessionEvent(e),
    link: { to: '/community', label: '세션 기록 보기' },
  },
  {
    id: 'joint',
    title: '연합 행사',
    body: '다른 학교와 함께 여는 행사입니다. 동홍동락은 동국대와 홍익대의 교류전이고, 동지톤은 함께 여는 해커톤입니다.',
    method: '교류전 · 해커톤',
    venue: true,
    match: (e) => thisGen(e) && isJointEvent(e),
    link: { to: '/community', label: '행사 기록 보기' },
  },
]

/**
 * 이번 기수 일정 몇 줄 (사진이 없을 때 그 자리를 채우는 실제 기록).
 * 상자 · 4색 원 · 큰 제목 없이 괘선 시간표로만: 제목은 옆의 h3 가 이미 말한다.
 */
function Cover({ a, events, today }: { a: Activity; events: readonly ScheduleEvent[]; today: string }) {
  const rows = coverRows(events, today, a.match, 4)
  if (rows.length === 0) return null
  return (
    <div className={s.cover}>
      <p className={s.coverHead} aria-hidden="true">
        {SITE.generation} 일정
      </p>
      <ol className={s.coverRows} aria-label={`${SITE.generation} ${a.title} 일정`}>
        {rows.map((e) => {
          const past = (e.endDate ?? e.date) < today
          return (
            <li key={e.id} data-past={past || undefined}>
              <span className="num">{shortDay(e.date, today)}</span>
              <span>
                {a.strip ? e.title.replace(a.strip, '') : e.title}
                {a.venue && e.venue && <span className={s.coverVenue}> · {e.venue}</span>}
                {past && <span className="visually-hidden"> (지남)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function ActivityRow({ a, events, today }: { a: Activity; events: readonly ScheduleEvent[]; today: string }) {
  const span = eventSpan(events, a.match)
  const next = nextEvent(events, today, a.match)
  const period = a.period ?? (span ? spanLabel(span.start, span.end, today) : null)
  const pastJoint = a.id === 'joint' ? pastJointEvents(events, today).filter((e) => !thisGen(e)).slice(0, 3) : []

  return (
    <li className={s.activity}>
      <div className={s.activityText}>
        <h3 className={s.h3}>{a.title}</h3>
        <p className={s.text}>{a.body}</p>
      </div>
      <Cover a={a} events={events} today={today} />
      {pastJoint.length > 0 && (
        <div className={s.past}>
          <h4 className={s.pastTitle}>지난 연합 행사</h4>
          <ul className={s.miniList}>
            {pastJoint.map((e) => (
              <li key={e.id}>
                <span className="num">{e.date.slice(0, 7).replace('-', '.')}</span>
                <span>{e.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={s.activityMeta}>
        <dl className={s.facts}>
          {period && (
            <div>
              <dt>기간</dt>
              <dd className={a.period ? undefined : 'num'}>{period}</dd>
            </div>
          )}
          <div>
            <dt>방식</dt>
            <dd>{a.method}</dd>
          </div>
          {a.scale && (
            <div>
              <dt>규모</dt>
              <dd>{a.scale}</dd>
            </div>
          )}
          {next && (
            <div>
              <dt>다음 일정</dt>
              <dd>
                <span className="num">{dayLabel(next.date, today)}</span>
                <br />
                {a.strip ? next.title.replace(a.strip, '') : next.title}
              </dd>
            </div>
          )}
        </dl>
        <Link className="link" to={a.link.to}>
          {a.link.label}
        </Link>
      </div>
    </li>
  )
}

/** 활동: 4기가 실제로 하는 일 세 가지. 기간 · 다음 일정 · 표지의 날짜는 일정 데이터에서 계산한다 */
export function ActivitiesSection() {
  const today = useToday()
  const { data } = useSchedule()
  const events = data ?? []
  // 연합 행사는 일정에 하나라도 있을 때만
  const list = ACTIVITIES.filter((a) => a.id !== 'joint' || events.some(a.match) || pastJointEvents(events, today).length > 0)

  return (
    <Section id="activities" title="활동" line="매주 여는 세션, 학기 단위 팀 프로젝트, 다른 학교와 여는 행사입니다.">
      <ul className={s.activities}>
        {list.map((a) => (
          <ActivityRow key={a.id} a={a} events={events} today={today} />
        ))}
      </ul>
    </Section>
  )
}
