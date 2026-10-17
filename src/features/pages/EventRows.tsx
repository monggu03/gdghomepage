import type { ReactNode } from 'react'
import { KIND_LABEL } from '@/config/kinds'
import { placeColor } from '@/config/places'
import type { ScheduleEvent } from '@/domain/types'
import { dateLabel } from './format'
import { Mark } from './PageParts'
import s from './pages.module.css'

/** 날짜 칸. 기간이면 '–' 뒤에서만 줄을 바꾼다 ('08.18 화–' / '08.31 월') */
function RowDate({ e, today }: { e: ScheduleEvent; today: string }) {
  const [from, to] = dateLabel(e.date, e.endDate, today).split('–')
  return (
    <span className={`${s.rowDate} num`}>
      {to && e.endDate ? (
        <>
          <time className={s.nowrap} dateTime={e.date}>
            {from}–
          </time>
          <wbr />
          <time className={s.nowrap} dateTime={e.endDate}>
            {to}
          </time>
        </>
      ) : (
        <time className={s.nowrap} dateTime={e.date}>
          {from}
        </time>
      )}
    </span>
  )
}

/**
 * 일정 · 행사 한 줄: 날짜 / 제목 + 연속 행사 · 장소 / 종류 / 끝 칸(D-day 같은 짧은 말 · ↗).
 * 원래 행사 페이지가 있으면 줄 전체가 그 페이지로 가는 링크이고, 끝에 작은 ↗ 하나를 둔다.
 */
export function EventRow({ e, today, note }: { e: ScheduleEvent; today: string; note?: ReactNode }) {
  // 제목에 이미 연속 행사 이름이 들어 있으면 한 번만 쓴다
  const series = e.series && !e.title.includes(e.series) ? e.series : null
  const sub = [series, e.venue].filter(Boolean).join(' · ')
  const body = (
    <>
      <RowDate e={e} today={today} />
      <span className={s.rowMain}>
        <span className={s.rowTitle}>{e.title}</span>
        {sub && <span className={s.rowSub}>{sub}</span>}
      </span>
      <span className={s.rowKind}>
        <Mark color={placeColor(e.place)} />
        {KIND_LABEL[e.kind]}
      </span>
      <span className={s.rowEnd}>
        {note && <span className={`${s.until} num`}>{note}</span>}
        {e.url && (
          <span className={s.rowArrow} aria-hidden="true">
            ↗
          </span>
        )}
      </span>
    </>
  )
  return (
    <li>
      {e.url ? (
        <a className={`${s.row} ${s.rowLink}`} href={e.url} target="_blank" rel="noreferrer">
          {body}
          <span className="visually-hidden"> (새 창)</span>
        </a>
      ) : (
        <div className={s.row}>{body}</div>
      )}
    </li>
  )
}

/**
 * 일정 · 행사 목록. note 는 줄마다 끝 칸에 붙일 짧은 말 (다가오는 일정의 'D-10').
 * note 가 없으면 끝 칸을 ↗ 하나만큼 좁힌다.
 */
export function EventRows({
  events,
  today,
  note,
  id,
  label,
}: {
  events: readonly ScheduleEvent[]
  today: string
  note?: (e: ScheduleEvent, index: number) => ReactNode
  id?: string
  label?: string
}) {
  return (
    <ul className={`${s.rows} ${note ? '' : s.rowsCompact}`} id={id} aria-label={label}>
      {events.map((e, i) => (
        <EventRow key={e.id} e={e} today={today} note={note?.(e, i)} />
      ))}
    </ul>
  )
}
