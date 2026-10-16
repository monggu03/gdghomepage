import { Link } from 'react-router-dom'
import { PLACE_BY_ID } from '@/config/places'
import { useRepositories } from '@/data/useRepositories'
import { useAsync } from '@/hooks/useAsync'
import { useToday } from '@/hooks/useToday'
import { isYmd, shortDate } from '@/lib/date'
import { useCampus } from '@/state/useCampus'
import s from './hud.module.css'

/** 지도에서 고른 장소의 미리보기: 설명 + 최신 3개 + 페이지로 가기 */
export function PlacePanel() {
  const { selected } = useCampus()
  const place = PLACE_BY_ID[selected]
  const repos = useRepositories()
  const today = useToday()
  const latest = useAsync(`previews:${selected}:3`, () => repos.previews.latest(selected, 3))

  return (
    <article className={`${s.place} card`} aria-live="polite">
      <div className={s.placeHead}>
        {place.id === 'about' ? (
          <span className={`dots ${s.placeDots}`} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        ) : (
          <i className={s.placeSwatch} style={{ background: place.color }} />
        )}
        <div className={s.placeTitle}>
          <h2>{place.label}</h2>
          <small>{place.sub}</small>
        </div>
        {place.live && <span className="live-badge">진행 중</span>}
      </div>
      <p className={s.placeDesc}>{place.description}</p>
      <ul className={s.latest}>
        {(latest.data ?? []).map((item) => (
          <li key={item.title}>
            <span className={s.latestWhen}>{isYmd(item.when) ? shortDate(item.when, today) : item.when}</span>
            <span className={s.latestTitle}>{item.title}</span>
            {item.sample ? (
              <span className="sample-badge">예시</span>
            ) : (
              isYmd(item.when) && item.when > today && <span className="sample-badge">예정</span>
            )}
          </li>
        ))}
      </ul>
      {place.id === 'about' ? (
        <button type="button" className={s.more} onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}>
          소개 더 보기 →
        </button>
      ) : (
        <Link className={s.more} to={place.path}>
          {place.label} 페이지로 →
        </Link>
      )}
    </article>
  )
}
