import { Link } from 'react-router-dom'
import { PAGE_PLANS, type PagePlan, type PagePlanId } from '@/config/pages'
import { placeColor } from '@/config/places'
import { RECRUIT_FACTS, SHOW_PLAN, SITE } from '@/config/site'
import { usePreviews } from '@/data/queries'
import type { PreviewPlace } from '@/data/repositories'
import { useToday } from '@/hooks/useToday'
import { shortDate } from '@/lib/date'
import s from './pages.module.css'

function Preview({ place }: { place: PreviewPlace }) {
  const today = useToday()
  const { data, isPending, isError } = usePreviews(place, 6)
  if (isError) return <p className={s.state}>최근 글을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.</p>
  if (isPending) return <p className={s.state}>불러오는 중…</p>
  if (data.length === 0) return <p className={s.state}>아직 올라온 글이 없습니다.</p>
  return (
    <ul className={s.previewGrid}>
      {data.map((item) => (
        <li key={item.id} className={s.previewCard} style={{ ['--c' as string]: placeColor(place) }}>
          <div className={s.previewMeta}>
            {item.tag && <span className={s.tag}>{item.tag}</span>}
            <span>{item.date ? shortDate(item.date, today) : item.label}</span>
            {item.sample && <span className="sample-badge">예시</span>}
          </div>
          <b>{item.title}</b>
        </li>
      ))}
    </ul>
  )
}

/** Recruits: 확인된 사실만 보여주고, 정해지지 않은 건 '공지 예정'으로 둔다 */
function RecruitInfo() {
  return (
    <section className={s.block} aria-labelledby="recruit-info">
      <h2 id="recruit-info">지원 안내</h2>
      <dl className={s.facts}>
        {RECRUIT_FACTS.map((f) => (
          <div key={f.id}>
            <dt>{f.label}</dt>
            <dd>{f.body}</dd>
          </div>
        ))}
      </dl>
      <div className={s.actions}>
        <a className={s.primary} href={SITE.links.instagram} target="_blank" rel="noreferrer">
          인스타그램에서 소식 받기 ↗
        </a>
        <a className={s.secondary} href={SITE.links.linktree} target="_blank" rel="noreferrer">
          모든 링크 ↗
        </a>
      </div>
    </section>
  )
}

/** 팀 내부용 기획 메모. 외부 방문자에게는 보이지 않는다 (SHOW_PLAN) */
function PlanNotes({ id, plan }: { id: PagePlanId; plan: PagePlan }) {
  return (
    <section className={`${s.block} ${s.notes}`} aria-labelledby={`${id}-plan`}>
      <h2 id={`${id}-plan`}>
        팀 기획 메모 <span className="sample-badge">와이어프레임 {plan.wireframe}</span>
      </h2>
      <h3>들어갈 기능</h3>
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
  )
}

/**
 * 아직 만들지 않은 페이지. 방문자에게는 무엇이 올 곳인지와 최근 글을 보여준다.
 * 실제 페이지를 만들면 config/pages.ts 에서 지우고 라우터에 새 페이지를 연결한다.
 */
export function PlannedPage({ id }: { id: PagePlanId }) {
  const plan: PagePlan = PAGE_PLANS[id]
  return (
    <div className={s.page}>
      <header className={s.head}>
        <span className={s.swatch} style={{ background: plan.place ? placeColor(plan.place) : 'var(--ink)' }} aria-hidden="true" />
        <div>
          <h1>{plan.title}</h1>
          <p>{plan.sub}</p>
        </div>
        <span className="soon-badge">준비 중</span>
      </header>
      <p className={s.lead}>{plan.lead}</p>

      {id === 'recruits' && <RecruitInfo />}

      {/* Recruits 는 위 '지원 안내'가 같은 내용을 담으므로 최근 글을 따로 두지 않는다 */}
      {plan.place && id !== 'recruits' && (
        <section className={s.block} aria-labelledby={`${id}-preview`}>
          <h2 id={`${id}-preview`}>최근 글</h2>
          <Preview place={plan.place} />
        </section>
      )}

      {SHOW_PLAN && <PlanNotes id={id} plan={plan} />}

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
