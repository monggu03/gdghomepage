import { useLayoutEffect, useRef, useState } from 'react'
import { SITE, SPRINT } from '@/config/site'
import { useToday } from '@/hooks/useToday'
import { ddayLabel } from '@/lib/date'
import { sprintProgress } from '@/lib/sprint'
import s from './hud.module.css'

/** G-Sprint 진행 바. Demo Day(성과공유회)를 마지막 단계로 둔다 */
export function SprintTracker() {
  const today = useToday()
  const { current, ratio } = sprintProgress(
    SPRINT.steps.map((st) => st.date),
    today,
  )
  const wrap = useRef<HTMLDivElement>(null)
  const [bar, setBar] = useState({ width: 0, today: 0, full: 0 })

  // 막대 길이는 단계 동그라미의 실제 위치를 재서 정한다 (화면 폭에 따라 달라짐)
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const measure = () => {
      const items = Array.from(el.querySelectorAll<HTMLElement>('[data-step]'))
      if (!items.length) return
      const cx = (i: number) => items[i].offsetLeft + items[i].offsetWidth / 2
      const last = items.length - 1
      const pos = current === 0 ? cx(0) : current > last ? cx(last) : cx(current - 1) + (cx(current) - cx(current - 1)) * Math.min(1, ratio)
      setBar({ width: Math.max(0, pos - 14), today: pos, full: cx(last) - 14 })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [current, ratio])

  return (
    <section className={`${s.track} card`} aria-label={`${SPRINT.title} 진행`}>
      <div className={s.trackHead}>
        <span className="gen-badge">{SITE.generation}</span>
        <h2>{SPRINT.title}</h2>
        {current < SPRINT.steps.length && <span className="live-badge">진행 중</span>}
        <span className={s.spacer} />
        <span className={s.dd}>
          Demo Day까지<b>{ddayLabel(SPRINT.demoDay, today)}</b>
        </span>
      </div>
      <div ref={wrap} className={s.steps}>
        <span className={s.rail} aria-hidden="true" />
        <span className={s.bar} style={{ width: bar.width, backgroundSize: `${bar.full}px 100%` }} aria-hidden="true" />
        <span className={s.todayTag} style={{ left: bar.today }} aria-hidden="true">
          오늘
        </span>
        <ol className={s.stepList}>
        {SPRINT.steps.map((st, i) => {
          const state = i < current ? s.done : i === current ? s.now : ''
          const last = i === SPRINT.steps.length - 1
          return (
            <li key={st.label} data-step className={`${s.step} ${state} ${last ? s.lastStep : ''}`}>
              <span className={s.dot}>{i < current ? '✓' : ''}</span>
              <b>{st.label}</b>
              {st.when}
              {'note' in st && <small>{st.note}</small>}
              <span className="visually-hidden">{i < current ? '완료' : i === current ? '다음 단계' : '예정'}</span>
            </li>
          )
        })}
        </ol>
      </div>
    </section>
  )
}
