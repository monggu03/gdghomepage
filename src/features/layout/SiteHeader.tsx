import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { NAV_ORDER, PLACE_BY_ID, navLabel } from '@/config/places'
import { useCampusActions } from '@/state/useCampus'
import { MobileMenu } from './MobileMenu'
import { SearchDialog } from './SearchDialog'
import { Wordmark } from './Wordmark'
import s from './layout.module.css'

/** 조금이라도 내려가면 머리말 아래에 1px 선을 긋는다 */
function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 2)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return scrolled
}

/**
 * 모든 페이지 공통 머리말: 64px 흰 띠, 위에 붙어 있다.
 * 메뉴에 마우스를 올리면 지도에서 같은 건물이 올라온다 (메뉴 = 지도).
 * 폰(900px 이하)에서는 워드마크 · 검색 · 메뉴 버튼 한 줄로 줄이고, 메뉴는 전체 화면 시트로 연다.
 */
export function SiteHeader() {
  const { hover } = useCampusActions()
  const scrolled = useScrolled()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const searchBtnRef = useRef<HTMLButtonElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  // Ctrl/⌘ + K 로 어디서든 검색 창을 연다
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setMenuOpen(false)
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className={s.header} data-scrolled={scrolled || undefined}>
        <div className={`container ${s.bar}`}>
          {/* 읽히는 이름 = 보이는 글자 + '홈' */}
          <Link className={s.brand} to="/">
            <Wordmark />
            <span className="visually-hidden"> 홈</span>
          </Link>
          <nav className={s.nav} aria-label="주요 메뉴">
            <ul>
              {NAV_ORDER.map((id) => (
                <li key={id}>
                  <NavLink
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
                </li>
              ))}
            </ul>
          </nav>
          <div className={s.tools}>
            <button
              ref={searchBtnRef}
              type="button"
              className={s.iconBtn}
              aria-haspopup="dialog"
              aria-keyshortcuts="Control+K Meta+K"
              onClick={() => setSearchOpen(true)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
              <span className="visually-hidden">검색</span>
            </button>
            <button ref={menuBtnRef} type="button" className={`${s.iconBtn} ${s.menuBtn}`} aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              <span className="visually-hidden">메뉴</span>
            </button>
          </div>
        </div>
      </header>
      {/* 폰 메뉴 안에서 연 검색을 닫으면 메뉴는 이미 닫혀 있다: 초점은 머리말의 메뉴 버튼으로 */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} returnFallbacks={[menuBtnRef, searchBtnRef]} />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSearch={() => {
          setMenuOpen(false)
          setSearchOpen(true)
        }}
      />
    </>
  )
}
