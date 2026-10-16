import { Link } from 'react-router-dom'
import { PLACE_BY_ID } from '@/config/places'
import { ABOUT_FACTS } from '@/config/site'
import { usePreviews } from '@/data/queries'
import type { PreviewItem } from '@/domain/types'
import { useToday } from '@/hooks/useToday'
import { shortDate } from '@/lib/date'
import { useCampus } from '@/state/useCampus'
import { PLACE_PANEL_ID } from './shared'
import s from './hud.module.css'

const LATEST = 3

function LatestRow({ item, today }: { item: PreviewItem; today: string }) {
  return (
    <li>
      <span className={s.latestWhen}>{item.date ? shortDate(item.date, today) : item.label}</span>
      <span className={s.latestTitle}>{item.title}</span>
      {item.sample ? <span className="sample-badge">예시</span> : item.date && item.date > today && <span className="soon-badge">예정</span>}
    </li>
  )
}

/** 지도에서 고른 장소의 미리보기: 설명 + 최신 3개 + 페이지로 가기 */
export function PlacePanel() {
  const { selected } = useCampus()
  const place = PLACE_BY_ID[selected]
  const today = useToday()
  const about = selected === 'about'
  const latest = usePreviews(about ? null : selected, LATEST)

  let rows
  if (about) {
    rows = ABOUT_FACTS.map((f) => <LatestRow key={f.id} item={{ id: f.id, label: f.label, title: f.title }} today={today} />)
  } else if (latest.isError) {
    rows = <li className={s.latestState}>최근 글을 불러오지 못했습니다</li>
  } else if (latest.isPending) {
    rows = Array.from({ length: LATEST }, (_, i) => (
      <li key={i} className={s.latestSkeleton} aria-hidden="true">
        <i />
        <i />
      </li>
    ))
  } else if (latest.data.length === 0) {
    rows = <li className={s.latestState}>아직 올라온 글이 없습니다</li>
  } else {
    rows = latest.data.map((item) => <LatestRow key={item.id} item={item} today={today} />)
  }

  return (
    <article id={PLACE_PANEL_ID} className={`${s.place} card`} aria-labelledby="place-panel-title">
      <div className={s.placeHead}>
        {about ? (
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
          <h2 id="place-panel-title">{place.label}</h2>
          <small>{place.sub}</small>
        </div>
      </div>
      <p className={s.placeDesc}>{place.description}</p>
      <ul className={s.latest} aria-busy={!about && latest.isPending}>
        {rows}
      </ul>
      {about ? (
        <button type="button" className={s.more} onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          소개 더 보기 ↓
        </button>
      ) : (
        <Link className={s.more} to={place.path}>
          {place.label} 페이지로 →
        </Link>
      )}
      {/* 장소가 바뀌었다는 것만 짧게 읽어 준다 (카드 전체를 다시 읽지 않게) */}
      <span className="visually-hidden" role="status">
        {place.label} 미리보기
      </span>
    </article>
  )
}
