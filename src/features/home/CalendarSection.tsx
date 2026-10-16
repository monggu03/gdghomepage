import { useMemo, useState } from 'react'
import { PLACE_BY_ID } from '@/config/places'
import { useRepositories } from '@/data/useRepositories'
import type { ScheduleEvent } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { useToday } from '@/hooks/useToday'
import { monthDay, monthGrid, shiftMonth, weekday } from '@/lib/date'
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

const colorOf = (e: ScheduleEvent) => (e.kind === 'rest' ? 'var(--line)' : PLACE_BY_ID[e.place].color)

/** 월 단위 캘린더 (배범서 기획: 행사 일정과 마감일) */
export function CalendarSection() {
  const repos = useRepositories()
  const today = useToday()
  const { data } = useAsync('schedule', () => repos.schedule.list())
  const [ym, setYm] = useState(() => ({ year: +today.slice(0, 4), month: +today.slice(5, 7) }))
  const days = useMemo(() => byDay(data ?? []), [data])
  const cells = monthGrid(ym.year, ym.month)
  const prefix = `${ym.year}-${String(ym.month).padStart(2, '0')}`
  const monthEvents = (data ?? []).filter((e) => e.date.startsWith(prefix) || (e.endDate ?? '').startsWith(prefix))

  return (
    <section className={s.section} aria-labelledby="calendar-title">
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
      <div className={s.calendar} role="grid" aria-label={`${ym.year}년 ${ym.month}월`}>
        {WEEK.map((w) => (
          <div key={w} className={s.calHead} role="columnheader">
            {w}
          </div>
        ))}
        {cells.map((c) => {
          const list = days.get(c.ymd) ?? []
          const cls = [s.calCell, !c.inMonth && s.calOut, c.ymd === today && s.calToday].filter(Boolean).join(' ')
          return (
            <div key={c.ymd} className={cls} role="gridcell" aria-label={`${c.ymd}${list.length ? ` 일정 ${list.length}개` : ''}`}>
              <span className={s.calNum}>{+c.ymd.slice(8)}</span>
              {list.map((e) => (
                <span key={e.title} className={s.calEvent} style={{ ['--c' as string]: colorOf(e) }} title={e.title}>
                  {e.title}
                </span>
              ))}
            </div>
          )
        })}
      </div>
      {/* 폰에서는 칸이 작아서 이 달 일정을 목록으로 한 번 더 보여준다 */}
      <ul className={s.calList}>
        {monthEvents.length === 0 && <li className={s.calEmpty}>이 달에는 등록된 일정이 없습니다</li>}
        {monthEvents.map((e) => (
          <li key={e.title}>
            <i style={{ background: colorOf(e) }} />
            <span className={s.calListWhen}>
              {monthDay(e.date)} ({weekday(e.date)})
            </span>
            <span>{e.title}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
