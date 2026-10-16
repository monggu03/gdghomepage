import { Link } from 'react-router-dom'
import { PAGE_PLANS, type PagePlan, type PagePlanId } from '@/config/pages'
import { PLACE_BY_ID } from '@/config/places'
import { useRepositories } from '@/data/useRepositories'
import type { PlaceId } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { useToday } from '@/hooks/useToday'
import { isYmd, shortDate } from '@/lib/date'
import s from './pages.module.css'

function Preview({ place }: { place: PlaceId }) {
  const repos = useRepositories()
  const today = useToday()
  const { data } = useAsync(`previews:${place}:6`, () => repos.previews.latest(place, 6))
  return (
    <ul className={s.previewGrid}>
      {(data ?? []).map((item) => (
        <li key={item.title} className={s.previewCard}>
          <div className={s.thumb} style={{ ['--c' as string]: PLACE_BY_ID[place].color }} aria-hidden="true" />
          <div className={s.previewMeta}>
            {item.tag && <span className={s.tag}>{item.tag}</span>}
            <span>{isYmd(item.when) ? shortDate(item.when, today) : item.when}</span>
            {item.sample && <span className="sample-badge">예시</span>}
          </div>
          <b>{item.title}</b>
        </li>
      ))}
    </ul>
  )
}

/**
 * 아직 만들지 않은 페이지. 계획(config/pages.ts)을 그대로 보여준다.
 * 실제 페이지를 만들면 라우터에서 이 컴포넌트 대신 새 페이지를 연결한다.
 */
export function PlannedPage({ id }: { id: PagePlanId }) {
  const plan: PagePlan = PAGE_PLANS[id]
  const color = plan.place ? PLACE_BY_ID[plan.place].color : 'var(--ink)'
  return (
    <div className={s.page}>
      <header className={s.head}>
        <span className={s.swatch} style={{ background: color }} aria-hidden="true" />
        <div>
          <h1>{plan.title}</h1>
          <p>{plan.sub}</p>
        </div>
        <span className="sample-badge">준비 중 · 와이어프레임 {plan.wireframe}</span>
      </header>

      {plan.place && (
        <section className={s.block} aria-labelledby={`${id}-preview`}>
          <h2 id={`${id}-preview`}>최근 글</h2>
          <Preview place={plan.place} />
        </section>
      )}

      <section className={s.block} aria-labelledby={`${id}-plan`}>
        <h2 id={`${id}-plan`}>들어갈 기능</h2>
        <ul className={s.list}>
          {plan.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {plan.open && (
          <>
            <h3>팀에서 정할 것</h3>
            <ul className={s.list}>
              {plan.open.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <Link className={s.back} to="/">
        ← 지도로 돌아가기
      </Link>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className={s.page}>
      <header className={s.head}>
        <div>
          <h1>페이지를 찾을 수 없습니다</h1>
          <p>주소를 다시 확인해 주세요.</p>
        </div>
      </header>
      <Link className={s.back} to="/">
        ← 홈으로
      </Link>
    </div>
  )
}
