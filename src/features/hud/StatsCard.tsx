import { useEffect, useState } from 'react'
import { SITE } from '@/config/site'
import { useRepositories } from '@/data/useRepositories'
import { useAsync } from '@/hooks/useAsync'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { useToday } from '@/hooks/useToday'
import { ddayLabel, monthDay, weekday } from '@/lib/date'
import s from './hud.module.css'

/** 0에서 목표 숫자까지 1.1초 동안 올라가는 숫자 */
function CountUp({ to }: { to: number }) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (reduce) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, reduce])
  return <>{reduce ? to : n}</>
}

/** 한눈에 보기: 숫자 3개 + 다음 일정까지 D-n */
export function StatsCard() {
  const repos = useRepositories()
  const today = useToday()
  const stats = useAsync('stats', () => repos.stats.list())
  const schedule = useAsync('schedule', () => repos.schedule.list())
  const next = schedule.data?.find((e) => e.kind !== 'rest' && (e.endDate ?? e.date) >= today)
  const anySample = stats.data?.some((x) => x.sample)

  return (
    <section className={`${s.stats} card`} aria-label="한눈에 보기">
      <div className={s.statsHead}>
        <span className="gen-badge">{SITE.generation}</span>
        <b>한눈에 보기</b>
        <span className={s.spacer} />
        {anySample && <span className="sample-badge">숫자는 예시</span>}
      </div>
      <div className={s.statGrid}>
        {(stats.data ?? []).map((st) => (
          <div key={st.id} className={s.stat}>
            <small>
              <i className={s.disc} style={{ background: st.color }} />
              {st.label}
            </small>
            <strong>
              <CountUp to={st.value} />
            </strong>
            <em>{st.note}</em>
          </div>
        ))}
        <div className={s.stat}>
          <small>
            <i className={s.disc} style={{ background: 'var(--g-green)' }} />
            다음 일정까지
          </small>
          <strong>{next ? ddayLabel(next.date, today) : '–'}</strong>
          <em title={next ? `${next.title} · ${monthDay(next.date)} (${weekday(next.date)})` : undefined}>{next?.title ?? '예정된 일정 없음'}</em>
        </div>
      </div>
    </section>
  )
}
