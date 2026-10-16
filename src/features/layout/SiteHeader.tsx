import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { NAV_ORDER, PLACE_BY_ID, navLabel } from '@/config/places'
import { SITE } from '@/config/site'
import { useIsNarrow } from '@/hooks/useMediaQuery'
import { useCampusActions } from '@/state/useCampus'
import { SearchBox } from '../hud/SearchBox'
import { HEADER_ATTR } from './headerAttr'
import s from './layout.module.css'

/**
 * 모든 페이지 공통 머리말. 홈에서는 지도 위에 떠 있고(overlay), 다른 페이지에서는 위에 붙어 있다(bar).
 * 메뉴에 마우스를 올리면 지도에서 같은 건물이 올라온다 (메뉴 = 지도).
 * 폰에서는 검색창을 돋보기 버튼 뒤에 접어 머리말 높이를 줄인다.
 */
export function SiteHeader({ variant }: { variant: 'overlay' | 'bar' }) {
  const { hover, setHits } = useCampusActions()
  const narrow = useIsNarrow()
  const [searchOpen, setSearchOpen] = useState(false)
  const showSearch = !narrow || searchOpen

  const toggleSearch = () => {
    if (searchOpen) setHits(null)
    setSearchOpen(!searchOpen)
  }

  return (
    <header className={`${s.header} ${variant === 'overlay' ? s.overlay : s.bar}`} {...{ [HEADER_ATTR]: '' }}>
      <div className={`${s.headerInner} card`}>
        {/* 읽히는 이름 = 보이는 글자 + '홈' (보이는 글자와 다른 aria-label 은 음성 명령 사용자를 헷갈리게 한다) */}
        <Link className={s.brand} to="/">
          <span className="dots" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className={s.brandName}>{SITE.shortName}</span>{' '}
          <span className="gen-badge">{SITE.generation}</span>
          <span className="visually-hidden"> 홈</span>
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
        {showSearch && <SearchBox className={s.search} autoFocus={narrow} onClose={narrow ? () => setSearchOpen(false) : undefined} />}
        {narrow && (
          <button type="button" className={s.searchToggle} aria-expanded={searchOpen} aria-label={searchOpen ? '검색 닫기' : '검색 열기'} onClick={toggleSearch}>
            {searchOpen ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
            )}
          </button>
        )}
        <Link className={s.cta} to="/recruits">
          지원하기
        </Link>
      </div>
    </header>
  )
}
