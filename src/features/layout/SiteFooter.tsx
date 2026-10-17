import { Link, NavLink } from 'react-router-dom'
import { NAV_ORDER, PLACE_BY_ID, navLabel, placeColor } from '@/config/places'
import { SITE } from '@/config/site'
import { CHAPTER, CONTENT_UPDATED_AT } from '@/content'
import s from './layout.module.css'

/** 'github.com/GDSC-DGU' 처럼 주소의 마지막 이름 */
const lastSegment = (url: string) => url.replace(/\/+$/, '').split('/').pop() ?? url

const organizers = CHAPTER.organizers.filter((o) => o.generation === 4)

/**
 * 꼬리말: 이름 · 둘러보기 · 연락 · 지금 기수 · 안내 문구.
 * 연락처는 공개 출처가 있는 것만 (src/content/chapter.json, config/site.ts).
 */
export function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={`container ${s.footerGrid}`}>
        <div className={s.footerName}>
          <span className={s.wordmark} lang="en">
            {SITE.shortName}
          </span>
          <span lang="en">{SITE.fullName}</span>
        </div>

        <nav className={s.footerCol} aria-labelledby="footer-browse">
          <h2 id="footer-browse">둘러보기</h2>
          <ul>
            {NAV_ORDER.map((id) => (
              <li key={id}>
                <NavLink to={PLACE_BY_ID[id].path} end={id === 'about'} className={s.footerLink}>
                  <i className="mark" style={{ ['--c' as string]: placeColor(id) }} aria-hidden="true" />
                  {navLabel(id)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.footerCol}>
          <h2 id="footer-contact">연락</h2>
          <ul aria-labelledby="footer-contact">
            <li>
              <a className={s.footerLink} href={SITE.links.instagram} target="_blank" rel="noreferrer">
                인스타그램 {SITE.links.instagramHandle} ↗
              </a>
            </li>
            {CHAPTER.email && (
              <li>
                <a className={s.footerLink} href={`mailto:${CHAPTER.email}`}>
                  {CHAPTER.email}
                </a>
              </li>
            )}
            {CHAPTER.github && (
              <li>
                <a className={s.footerLink} href={CHAPTER.github} target="_blank" rel="noreferrer">
                  GitHub {lastSegment(CHAPTER.github)} ↗
                </a>
              </li>
            )}
            {CHAPTER.chapterPage && (
              <li>
                <a className={s.footerLink} href={CHAPTER.chapterPage} target="_blank" rel="noreferrer">
                  gdg.community.dev 챕터 페이지 ↗
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className={s.footerCol}>
          <h2 id="footer-gen">{SITE.generation}</h2>
          <dl aria-labelledby="footer-gen" className={s.footerFacts}>
            <div>
              <dt>기간</dt>
              <dd className="num">{SITE.generationYears}</dd>
            </div>
            {organizers.map((o) => (
              <div key={o.name}>
                <dt lang="en">{o.role}</dt>
                <dd>{o.name}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={s.footerNotes}>
          <p>{SITE.shortName}는 동국대학교 학생이 운영하는 Google Developer Groups on Campus 챕터입니다. Google이 운영하거나 보증하는 단체가 아닙니다.</p>
          <p>이 홈페이지는 4기 G-Sprint 팀이 만들고 있습니다.</p>
        </div>

        <div className={s.footerBottom}>
          <span>
            최근 업데이트 <span className="num">{CONTENT_UPDATED_AT.replaceAll('-', '.')}</span>
          </span>
          <span>
            © <span className="num">2026</span> {SITE.shortName}
          </span>
          <Link className={s.admin} to="/admin">
            운영진 로그인
          </Link>
        </div>
      </div>
    </footer>
  )
}
