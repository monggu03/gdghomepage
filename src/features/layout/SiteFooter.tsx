import { Link } from 'react-router-dom'
import { SITE } from '@/config/site'
import s from './layout.module.css'

/** 주소가 정해진 링크만 보여준다. 이메일 · 링크드인 · 깃허브는 config/site.ts 에 넣으면 나온다 */
const LINKS = [
  { label: `인스타그램 ${SITE.links.instagramHandle}`, href: SITE.links.instagram },
  { label: '링크 모음', href: SITE.links.linktree },
  { label: '이메일', href: SITE.links.email && `mailto:${SITE.links.email}` },
  { label: '링크드인', href: SITE.links.linkedin },
  { label: '깃허브', href: SITE.links.github },
].filter((l): l is { label: string; href: string } => Boolean(l.href))

/** 배범서 기획 푸터: 로고, 연락 채널, SNS, 관리자 로그인, All rights reserved */
export function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <div className={s.footerBrand}>
          <span className="dots" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <b>{SITE.shortName}</b>
          <span>{SITE.fullName}</span>
        </div>
        <div className={s.footerContact}>
          <span>협업 · 연사 문의</span>
          <ul className={s.footerLinks}>
            {LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className={s.disclaimer}>
          {SITE.shortName}는 동국대학교 학생이 운영하는 커뮤니티입니다. 구글이 운영하거나 보증하는 단체가 아닙니다.
        </p>
        <div className={s.footerBottom}>
          <span>
            © 2026 {SITE.shortName} · {SITE.generation} ({SITE.generationYears})
          </span>
          <Link to="/admin">운영진 로그인</Link>
        </div>
      </div>
    </footer>
  )
}
