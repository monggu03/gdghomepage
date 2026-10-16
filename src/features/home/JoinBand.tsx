import { Link } from 'react-router-dom'
import { SITE } from '@/config/site'
import s from './home.module.css'

export function JoinBand() {
  return (
    <section className={s.join} aria-labelledby="join-title">
      <div className={`${s.blob} ${s.joinBlob}`} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className={s.joinText}>
        <span className={s.eyebrow}>5기</span>
        <h2 id="join-title">다음 기수 모집</h2>
        <p>4기는 8월(코어 멤버)과 9월 초(일반 멤버)에 모집했습니다. 5기 일정이 정해지면 지원 안내 페이지와 인스타그램에 먼저 공지합니다.</p>
      </div>
      <div className={s.joinActions}>
        <Link className={s.joinCta} to="/recruits">
          지원 안내 보기
        </Link>
        <a className={s.joinSub} href={SITE.links.instagram} target="_blank" rel="noreferrer">
          인스타그램 ↗
        </a>
      </div>
    </section>
  )
}
