import { SITE } from '@/config/site'
import s from './home.module.css'

/** 활동 사진 자리. 실제 사진은 챕터 드라이브(마케팅/행사 사진)에서 골라 넣는다 */
const PHOTOS = [
  { title: 'Welcome Session', date: '2026.09.15' },
  { title: 'Core Session #1', date: '2026.09.22' },
  { title: 'Core Session #2', date: '2026.10.06' },
  { title: 'G-Sprint Kick-off', date: '2026.10.13' },
]

/** GDGoC DGU 소개: 글 + 옆으로 넘기는 사진 */
export function IntroSection() {
  return (
    <section id="intro" className={s.section} aria-labelledby="intro-title">
      <div className={s.sectionHead}>
        <span className={s.eyebrow}>
          <span className="gen-badge">{SITE.generation}</span>
          {SITE.generationYears}
        </span>
        <h2 id="intro-title">GDGoC DGU 소개</h2>
      </div>
      <div className={s.introBody}>
        <p className={s.lead}>
          {SITE.fullName}는 구글 개발자 커뮤니티의 동국대학교 챕터입니다. 4기는 듣는 활동보다 직접 만드는 활동을 중심으로 운영합니다.
        </p>
        <p className={s.values}>Connect · Learn · Grow</p>
      </div>
      <div className={s.photoRow} role="list" aria-label="활동 사진">
        {PHOTOS.map((p) => (
          <figure key={p.title} className={s.photo} role="listitem">
            <div className={s.photoSlot}>
              <span>사진 자리</span>
            </div>
            <figcaption>
              <b>{p.title}</b>
              <span>{p.date}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
