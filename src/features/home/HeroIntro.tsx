import { Link } from 'react-router-dom'
import { SITE } from '@/config/site'
import { useStats } from '@/data/queries'
import s from './home.module.css'

/** 실제 숫자가 들어왔을 때만 보이는 한 줄 (예시 숫자는 쓰지 않는다) */
function StatsRow() {
  const { data } = useStats()
  if (!data?.length) return null
  return (
    <dl className={s.statsRow}>
      {data.map((st) => (
        <div key={st.id}>
          <dt>{st.label}</dt>
          <dd>
            {st.value.toLocaleString('ko-KR')}
            {st.note && <small>{st.note}</small>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * 첫 화면 왼쪽 위: 이곳이 어디인지 한눈에 (h1 + 한 줄 소개 + 행동 2개).
 * 처음 온 사람이 지도보다 먼저 읽는 글이다.
 */
export function HeroIntro({ titleId }: { titleId: string }) {
  return (
    <div className={s.heroIntro}>
      <p className={s.kicker}>
        <span className="gen-badge">{SITE.generation}</span>
        <span>{SITE.generationYears} · 동국대학교</span>
      </p>
      <h1 id={titleId} className={s.heroTitle}>
        {SITE.shortName}
      </h1>
      <p className={s.heroFull} lang="en">
        {SITE.fullName}
      </p>
      <p className={s.heroPitch}>{SITE.pitch}</p>
      <div className={s.heroActions}>
        <button type="button" className={s.heroPrimary} onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          GDGoC DGU 알아보기
        </button>
        <Link className={s.heroSecondary} to="/recruits">
          5기 모집 안내
        </Link>
      </div>
      <StatsRow />
    </div>
  )
}
