import { useMemo, useState } from 'react'
import { placeColor } from '@/config/places'
import { useSchedule } from '@/data/queries'
import type { ScheduleEvent } from '@/domain/types'
import { useToday } from '@/hooks/useToday'
import { monthGrid, shiftMonth } from '@/lib/date'
import { eventsInMonth, rangeLabel } from '@/lib/schedule'
import { KIND_LABEL } from '../hud/shared'
import s from './home.module.css'

const WEEK = ['일', '월', '화', '수', '목', '금', '토']

/** 날짜별 일정 (여러 날 행사는 날마다 넣는다) */
function byDay(events: readonly ScheduleEvent[]): Map<string, ScheduleEvent[]> {
  const map = new Map<string, ScheduleEvent[]>()
  for (const e of events) {
    const end = e.endDate ?? e.date
    for (let d = new Date(`${e.date}T00:00:00Z`); d.toISOString().slice(0, 10) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = d.toISOString().slice(0, 10)
      map.set(key, [...(map.get(key) ?? []), e])
    }
  }
  return map
}

/** 휴회는 회색으로 */
const colorOf = (e: ScheduleEvent) => (e.kind === 'rest' ? 'var(--line)' : placeColor(e.place))

/**
 * 월 단위 캘린더 (배범서 기획: 행사 일정과 마감일).
 * 화면 읽기 프로그램에는 표(table)로 읽힌다: 주 = 행, 날짜 = 칸.
 */
export function CalendarSection() {
  const today = useToday()
  const { data } = useSchedule()
  const [ym, setYm] = useState(() => ({ year: +today.slice(0, 4), month: +today.slice(5, 7) }))
  const days = useMemo(() => byDay(data ?? []), [data])
  const cells = monthGrid(ym.year, ym.month)
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
  const monthEvents = eventsInMonth(data ?? [], ym.year, ym.month)
  const title = `${ym.year}년 ${ym.month}월`

  return (
    <section id="calendar" className={s.section} aria-labelledby="calendar-title">
      <div className={s.sectionHead}>
        <h2 id="calendar-title">캘린더</h2>
        <div className={s.monthNav}>
          <button type="button" onClick={() => setYm(shiftMonth(ym.year, ym.month, -1))} aria-label="이전 달">
            ‹
          </button>
          <b aria-live="polite">
            {ym.year}.{String(ym.month).padStart(2, '0')}
          </b>
          <button type="button" onClick={() => setYm(shiftMonth(ym.year, ym.month, 1))} aria-label="다음 달">
            ›
          </button>
        </div>
      </div>
      <div className={s.calendar} role="table" aria-label={`${title} 일정`}>
        <div className={s.calRow} role="row">
          {WEEK.map((w) => (
            <div key={w} className={s.calHead} role="columnheader">
              {w}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0].ymd} className={s.calRow} role="row">
            {week.map((c) => {
              const list = days.get(c.ymd) ?? []
              const isToday = c.ymd === today
              const cls = [s.calCell, !c.inMonth && s.calOut, isToday && s.calToday].filter(Boolean).join(' ')
              return (
                <div key={c.ymd} className={cls} role="cell">
                  <span className={s.calNum} aria-hidden="true">
                    {+c.ymd.slice(8)}
                  </span>
                  <span className="visually-hidden">
                    {+c.ymd.slice(5, 7)}월 {+c.ymd.slice(8)}일{isToday && ' 오늘'}
                  </span>
                  {list.map((e) => (
                    <span key={e.id} className={s.calEvent} style={{ ['--c' as string]: colorOf(e) }} title={e.title}>
                      {e.title}
                    </span>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {/* 폰에서는 칸이 작아서 이 달 일정을 목록으로 한 번 더 보여준다 */}
      <ul className={s.calList} aria-label={`${title} 일정 목록`}>
        {monthEvents.length === 0 && <li className={s.calEmpty}>이 달에는 등록된 일정이 없습니다</li>}
        {monthEvents.map((e) => (
          <li key={e.id}>
            <i style={{ background: colorOf(e) }} />
            <span className={s.calListWhen}>{rangeLabel(e)}</span>
            <span className={s.calListTitle}>{e.title}</span>
            <span className={s.calListKind}>{KIND_LABEL[e.kind]}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
