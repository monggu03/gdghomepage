import { useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { NAV_ORDER, PLACE_BY_ID, navLabel, placeColor } from '@/config/places'
import { SITE } from '@/config/site'
import { Wordmark } from './Wordmark'
import { useModalDialog } from './useModalDialog'
import s from './layout.module.css'

interface Props {
  open: boolean
  onClose: () => void
  /** 시트를 닫고 검색 창을 연다 */
  onSearch: () => void
}

/**
 * 폰 메뉴: 전체 화면 시트. 지도의 다섯 장소를 장소 표식 · 이름 · 한 줄 설명으로 보여준다 (줄 높이 52px).
 * <dialog> 의 showModal 이라 초점이 시트 안에만 돌고 Esc 로 닫힌다.
 */
export function MobileMenu({ open, onClose, onSearch }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const { ref, restoreFocus } = useModalDialog(open, closeRef)
  const close = () => ref.current?.close()

  return (
    <dialog
      ref={ref}
      className={s.sheet}
      aria-label="메뉴"
      onClose={() => {
        onClose()
        restoreFocus()
      }}
    >
      <div className={`container ${s.bar}`}>
        <Link className={s.brand} to="/" onClick={close}>
          <Wordmark />
          <span className="visually-hidden"> 홈</span>
        </Link>
        <div className={s.tools}>
          <button type="button" className={s.iconBtn} onClick={onSearch}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5" />
            </svg>
            <span className="visually-hidden">검색</span>
          </button>
          <button ref={closeRef} type="button" className={s.iconBtn} onClick={close}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            <span className="visually-hidden">메뉴 닫기</span>
          </button>
        </div>
      </div>
      <nav className={`container ${s.sheetNav}`} aria-label="주요 메뉴">
        <ul>
          {NAV_ORDER.map((id) => (
            <li key={id}>
              <NavLink to={PLACE_BY_ID[id].path} end={id === 'about'} className={({ isActive }) => `${s.sheetRow} ${isActive ? s.sheetActive : ''}`} onClick={close}>
                <i className="mark" style={{ ['--c' as string]: placeColor(id) }} aria-hidden="true" />
                <span className={s.sheetName}>{navLabel(id)}</span>
                <span className={s.sheetSub}>{PLACE_BY_ID[id].sub}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <p className={s.sheetFoot}>
          <a className="link" href={SITE.links.instagram} target="_blank" rel="noreferrer">
            인스타그램 {SITE.links.instagramHandle} ↗
          </a>
        </p>
      </nav>
    </dialog>
  )
}
