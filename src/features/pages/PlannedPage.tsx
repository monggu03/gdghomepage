import { Link, useLocation } from 'react-router-dom'
import { PAGE_PLANS, type PagePlan, type PagePlanId } from '@/config/pages'
import { NAV_ORDER, PLACE_BY_ID, navLabel, placeColor } from '@/config/places'
import { SHOW_PLAN, SITE } from '@/config/site'
import { CONTENT_UPDATED_AT } from '@/content'
import type { PlaceId } from '@/domain/types'
import { useToday } from '@/hooks/useToday'
import { dateLabel } from './format'
import { ExternalLink, Mark, PageHead, Section } from './PageParts'
import s from './pages.module.css'

/** 지금 열려 있는 페이지와 그 페이지에서 볼 수 있는 것 */
const OPEN_PAGES: Partial<Record<PlaceId, string>> = {
  about: '캠퍼스 지도로 보는 GDGoC DGU 소개',
  projects: 'G-Sprint 진행 상황과 지난 프로젝트',
  community: '다가오는 일정과 기수별 행사 기록',
  recruits: '모집 소식 · 지난 모집 기록 · 연락처',
}

/** 지금 볼 수 있는 페이지로 가는 줄 목록 (준비 중 · 찾을 수 없음 페이지 공통). 사이트 안 이동이라 화살표는 없다 */
function Destinations() {
  const ids = NAV_ORDER.filter((id) => OPEN_PAGES[id])
  return (
    <ul className={s.destinations}>
      {ids.map((id) => (
        <li key={id}>
          <Link to={PLACE_BY_ID[id].path} className={s.destination}>
            <span className={s.destName}>
              <Mark color={placeColor(id)} />
              {navLabel(id)}
            </span>
            <span className={s.destDesc}>{OPEN_PAGES[id]}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** 팀 내부용 기획 메모. 외부 방문자에게는 보이지 않는다 (SHOW_PLAN: npm run dev 또는 VITE_SHOW_PLAN=true) */
function PlanNotes({ id, plan }: { id: PagePlanId; plan: PagePlan }) {
  return (
    <Section id={`${id}-plan`} title="팀 기획 메모" desc={`개발 화면에서만 보입니다. 와이어프레임 ${plan.wireframe}`} quiet>
      <div className={s.notes}>
        <h3>들어갈 기능</h3>
        <ul>
          {plan.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {plan.open && (
          <>
            <h3>팀에서 정할 것</h3>
            <ul>
              {plan.open.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Section>
  )
}

/**
 * 아직 열지 않은 페이지 (/teams, /admin).
 * 무엇이 될지(리드) · 지금 상태(준비 중) · 여는 시기(미정) · 먼저 알릴 곳 · 지금 볼 수 있는 곳만 적는다 (DESIGN 10장).
 */
export function PlannedPage({ id }: { id: PagePlanId }) {
  const today = useToday()
  const plan: PagePlan = PAGE_PLANS[id]
  const color = plan.place ? placeColor(plan.place) : 'var(--ink-900)'
  return (
    <div className={`container ${s.page}`}>
      <PageHead
        mark={color}
        eyebrow={plan.sub}
        title={plan.title}
        lead={plan.lead}
        meta={
          <>
            <span className={s.statusTag}>준비 중</span> <span className="num">{dateLabel(CONTENT_UPDATED_AT, null, today)}</span> 기준
          </>
        }
      />

      <Section id="status" title="지금 상태">
        <dl className={s.facts}>
          <div>
            <dt>여는 시기</dt>
            <dd>아직 정하지 않았습니다.</dd>
          </div>
          <div>
            <dt>먼저 알리는 곳</dt>
            <dd>
              열리면{' '}
              <ExternalLink href={SITE.links.instagram} className={s.inlineLink}>
                인스타그램 {SITE.links.instagramHandle}
              </ExternalLink>
              에 가장 먼저 알립니다.
            </dd>
          </div>
        </dl>
      </Section>

      <Section id="elsewhere" title="지금 볼 수 있는 곳" quiet>
        <Destinations />
      </Section>

      {SHOW_PLAN && <PlanNotes id={id} plan={plan} />}
    </div>
  )
}

/** 없는 주소. 머리말 · 꼬리말 안에서 보인다 */
export function NotFoundPage() {
  const { pathname } = useLocation()
  return (
    <div className={`container ${s.page}`}>
      <PageHead
        wide
        eyebrow={<span className="num">404</span>}
        title="이 주소에는 페이지가 없습니다"
        lead="주소가 바뀌었거나 아직 만들지 않은 페이지입니다. 아래에서 찾던 곳을 골라 주세요."
        meta={
          <>
            요청한 주소 <code className={s.path}>{pathname}</code>
          </>
        }
      />
      <Section id="elsewhere" title="갈 수 있는 곳">
        <Destinations />
      </Section>
    </div>
  )
}
