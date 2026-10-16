import { Link } from 'react-router-dom'
import s from './home.module.css'

export function JoinBand() {
  return (
    <section className={s.join} aria-labelledby="join-title">
      <div>
        <span className={s.eyebrow}>5th</span>
        <h2 id="join-title">다음 기수 모집</h2>
        <p>모집 일정과 지원 방법은 Recruits 에 먼저 공지합니다.</p>
      </div>
      <Link className={s.joinCta} to="/recruits">
        지원 안내 보기
      </Link>
    </section>
  )
}
