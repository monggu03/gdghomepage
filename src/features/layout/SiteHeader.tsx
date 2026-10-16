import { Link, NavLink } from 'react-router-dom'
import { NAV_ORDER, PLACE_BY_ID, navLabel } from '@/config/places'
import { SITE } from '@/config/site'
import { useCampusActions } from '@/state/useCampus'
import { SearchBox } from '../hud/SearchBox'
import s from './layout.module.css'

/**
 * 모든 페이지 공통 머리말. 홈에서는 지도 위에 떠 있고(overlay), 다른 페이지에서는 위에 붙어 있다(bar).
 * 메뉴에 마우스를 올리면 지도에서 같은 건물이 올라온다 (메뉴 = 지도).
 */
export function SiteHeader({ variant }: { variant: 'overlay' | 'bar' }) {
  const { hover } = useCampusActions()
  return (
    <header className={`${s.header} ${variant === 'overlay' ? s.overlay : s.bar}`} data-site-header>
      <div className={`${s.headerInner} card`}>
        <Link className={s.brand} to="/" aria-label={`${SITE.shortName} 홈`}>
          <span className="dots" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className={s.brandName}>{SITE.shortName}</span>
          <span className="gen-badge">{SITE.generation}</span>
        </Link>
        <nav className={s.nav} aria-label="주요 메뉴">
          {NAV_ORDER.map((id) => (
            <NavLink
              key={id}
              to={PLACE_BY_ID[id].path}
              end={id === 'about'}
              className={({ isActive }) => `${s.navLink} ${isActive ? s.navActive : ''}`}
              onMouseEnter={() => hover(id)}
              onMouseLeave={() => hover(null)}
              onFocus={() => hover(id)}
              onBlur={() => hover(null)}
            >
              {navLabel(id)}
            </NavLink>
          ))}
        </nav>
        <SearchBox className={s.search} />
        <Link className={s.cta} to="/recruits">
          지원하기
        </Link>
      </div>
    </header>
  )
}
