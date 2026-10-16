import { placeColor } from '@/config/places'
import { useSchedule } from '@/data/queries'
import { useToday } from '@/hooks/useToday'
import { rangeLabel, upcomingEvents } from '@/lib/schedule'
import { useCampusActions } from '@/state/useCampus'
import { KIND_LABEL, PLACE_PANEL_ID } from './shared'
import s from './hud.module.css'

/** 다가오는 일정 5개 (휴회는 캘린더에만). 누르면 지도에서 해당 장소가 열린다 */
export function ScheduleCard() {
  const today = useToday()
  const { select } = useCampusActions()
  const { data, isPending, isError } = useSchedule()
  const upcoming = upcomingEvents(data ?? [], today, { limit: 5 })

  return (
    <section className={`${s.sched} card`} aria-labelledby="sched-title">
      <div className={s.schedHead}>
        <h2 id="sched-title">다가오는 일정</h2>
        <button type="button" onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          캘린더 ↓
        </button>
      </div>
      <ul>
        {isError && <li className={s.schedEmpty}>일정을 불러오지 못했습니다</li>}
        {isPending && <li className={s.schedEmpty}>불러오는 중…</li>}
        {data && upcoming.length === 0 && <li className={s.schedEmpty}>예정된 일정이 없습니다</li>}
        {upcoming.map((e) => {
          const year = e.date.slice(0, 4) !== today.slice(0, 4) ? `${e.date.slice(0, 4)}.` : ''
          return (
            <li key={e.id}>
              <button type="button" aria-controls={PLACE_PANEL_ID} onClick={() => select(e.place)}>
                <span className={s.schedWhen}>
                  {year}
                  {rangeLabel(e)}
                </span>
                <span className={s.schedTitle}>{e.title}</span>
                <span className={s.schedKind}>
                  <i style={{ background: placeColor(e.place) }} />
                  {KIND_LABEL[e.kind]}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
