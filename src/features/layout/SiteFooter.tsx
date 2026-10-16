import { Link } from 'react-router-dom'
import { SITE } from '@/config/site'
import s from './layout.module.css'

const LINKS: Array<{ label: string; href: string | null }> = [
  { label: '이메일', href: SITE.links.email && `mailto:${SITE.links.email}` },
  { label: '문의 채널', href: SITE.links.contact },
  { label: 'Instagram', href: SITE.links.instagram },
  { label: 'LinkedIn', href: SITE.links.linkedin },
  { label: 'GitHub', href: SITE.links.github },
]

/** 배범서 기획 푸터: 로고, 이메일, 문의 채널, SNS, 관리자 로그인, All rights reserved */
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
        <ul className={s.footerLinks}>
          {LINKS.map((l) => (
            <li key={l.label}>
              {l.href ? (
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ) : (
                <span title="주소가 정해지면 연결합니다">{l.label} · 준비 중</span>
              )}
            </li>
          ))}
        </ul>
        <div className={s.footerBottom}>
          <span>
            © 2026 {SITE.shortName}. All rights reserved. · {SITE.generation} ({SITE.generationYears})
          </span>
          <Link to="/admin">관리자 로그인</Link>
        </div>
      </div>
    </footer>
  )
}
