import { PLACE_BY_ID } from '@/config/places'
import { useRepositories } from '@/data/useRepositories'
import type { EventKind } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { useToday } from '@/hooks/useToday'
import { monthDay, weekday } from '@/lib/date'
import { useCampusActions } from '@/state/useCampus'
import s from './hud.module.css'

const KIND_LABEL: Record<EventKind, string> = { sprint: 'G-Sprint', event: '행사', session: '세션', notice: '공지', rest: '휴회' }

/** 다가오는 일정 5개. 누르면 지도에서 해당 장소가 열린다 */
export function ScheduleCard() {
  const repos = useRepositories()
  const today = useToday()
  const { select } = useCampusActions()
  const { data } = useAsync('schedule', () => repos.schedule.list())
  const upcoming = (data ?? []).filter((e) => (e.endDate ?? e.date) >= today).slice(0, 5)

  return (
    <section className={`${s.sched} card`} aria-label="다가오는 일정">
      <h2 className={s.schedHead}>
        다가오는 일정 <span>2026–27</span>
      </h2>
      <ul>
        {upcoming.length === 0 && <li className={s.schedEmpty}>예정된 일정이 없습니다</li>}
        {upcoming.map((e) => {
          const year = e.date.slice(0, 4) !== today.slice(0, 4) ? `${e.date.slice(0, 4)}.` : ''
          const when = e.endDate ? `${monthDay(e.date)}–${e.endDate.slice(8)}` : `${monthDay(e.date)} (${weekday(e.date)})`
          const color = e.kind === 'rest' ? 'var(--line)' : PLACE_BY_ID[e.place].color
          return (
            <li key={`${e.date}-${e.title}`}>
              <button type="button" onClick={() => select(e.place)}>
                <span className={s.schedWhen}>
                  {year}
                  {when}
                </span>
                <span className={s.schedTitle}>{e.title}</span>
                <span className={s.schedKind}>
                  <i style={{ background: color }} />
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
