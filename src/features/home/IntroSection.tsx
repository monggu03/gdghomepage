import { SITE } from '@/config/site'
import { useIsNarrow } from '@/hooks/useMediaQuery'
import s from './home.module.css'

/** 활동 사진 자리. 실제 사진은 챕터 드라이브(01_4기/마케팅/행사 사진)에서 골라 넣는다 */
const PHOTOS = [
  { title: 'Welcome Session', date: '2026.09.15', color: 'var(--g-blue)' },
  { title: 'Core Session #1', date: '2026.09.22', color: 'var(--g-red)' },
  { title: 'Core Session #2', date: '2026.10.06', color: 'var(--g-yellow)' },
  { title: 'G-Sprint 주제 발표', date: '2026.10.13', color: 'var(--g-green)' },
]

/** GDGoC DGU 소개: 글 + 활동 사진 */
export function IntroSection() {
  // 폰에서는 옆으로 넘기는 줄이라 키보드로도 스크롤할 수 있게 초점을 받는다
  const narrow = useIsNarrow()
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
          {SITE.shortName}({SITE.fullName})는 구글 개발자 커뮤니티의 동국대학교 챕터입니다. 4기는 듣는 활동보다 직접 만드는 활동을 중심으로 운영합니다.
        </p>
        <p className={s.values}>연결 · 배움 · 성장</p>
      </div>
      <ul className={s.photoRow} aria-label="4기 활동" tabIndex={narrow ? 0 : undefined}>
        {PHOTOS.map((p) => (
          <li key={p.title} className={s.photo}>
            {/* 사진이 들어오면 <img alt="…"> 로 바꾼다 */}
            <div className={s.photoSlot} style={{ ['--c' as string]: p.color }} aria-hidden="true">
              <span className={s.photoMark} />
            </div>
            <div className={s.photoCaption}>
              <b>{p.title}</b>
              <span>{p.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
