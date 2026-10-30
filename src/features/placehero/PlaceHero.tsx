import { useId, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PLACE_BY_ID, placeColor } from '@/config/places'
import { SITE } from '@/config/site'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useToday } from '@/hooks/useToday'
import { scrollToSection } from '@/features/home/scrollTo'
import { narrowFrame, viewBoxString, wideFrame, type HeroFrame } from './frame'
import { HeroScene } from './HeroScene'
import { buildingLook, type HeroPlace } from './look'
import { useHeroLayout } from './useHeroLayout'
import s from './placehero.module.css'

/**
 * 하위 페이지 머리: 홈 지도의 그 건물 앞에 서 있는 장면 + 건물 안내판(이 페이지 안의 묶음 목차).
 * - 제목 · 리드 · 기준 줄 · 안내판은 진짜 HTML. 장면(SVG)은 꾸밈이라 aria-hidden.
 * - 넓은 화면: 글자 왼쪽 | 장면 오른쪽(화면 끝까지), 안내판은 지붕에서 지시선으로 매단다.
 * - 1024 미만: 글자 → 작은 장면 (안내판은 넓은 화면에만. 시안 E)
 * - 건물 상태는 실제 데이터에서 (look.ts): G-Sprint 기간 · 모집 상태 · 공사 중.
 */
export type { HeroPlace } from './look'

export interface DirectoryRow {
  label: ReactNode
  value?: ReactNode
  /** 같은 페이지 안 섹션 '#id' 또는 다른 주소 */
  href?: string
  /** 지금 기수 표시(주황 4기 태그)를 붙일지 */
  current?: boolean
}

export interface PlaceHeroProps {
  place: HeroPlace
  eyebrow: ReactNode
  title: ReactNode
  lead?: ReactNode
  meta?: ReactNode
  /** 건물 안내판: 이 페이지 안의 주요 묶음 3–6줄 */
  directory?: DirectoryRow[]
  /** 건물 상태. 생략하면 장소별 기본값(G-Sprint · 모집 기간에서 계산) */
  state?: 'open' | 'closed' | 'construction'
  /** 커뮤니티 건물 지붕 화면에 띄울 다음 일정 */
  screen?: { date: string; title: string }
  /** 안내판 머리 글. 생략하면 '프로젝트 안내' 처럼 장소 이름 + 안내 */
  directoryTitle?: ReactNode
}

/** 이 폭 미만이면 위아래로 쌓는다 (pages.module.css 의 섹션과 같은 기준) */
export const HERO_STACK_QUERY = '(max-width: 1023px)'

const directoryName = (place: HeroPlace) => {
  const label = PLACE_BY_ID[place].label
  return label.endsWith('안내') ? label : `${label} 안내`
}

/** 같은 페이지 섹션으로: hash 주소(#/…) 미리보기에서도 라우터가 가로채지 않게 직접 옮긴다 */
function onSectionClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  const id = decodeURIComponent(href.slice(1))
  if (!document.getElementById(id)) return
  e.preventDefault()
  scrollToSection(id)
}

function RowBody({ row }: { row: DirectoryRow }) {
  return (
    <>
      <span className={s.rowLabel}>
        {row.current && <span className={`gen-tag ${s.rowTag}`}>{SITE.generation}</span>}
        {row.label}
      </span>
      {row.value !== undefined && row.value !== null && <span className={`num ${s.rowValue}`}>{row.value}</span>}
    </>
  )
}

function Row({ row }: { row: DirectoryRow }) {
  const { href } = row
  if (!href) {
    return (
      <li className={s.row}>
        <RowBody row={row} />
      </li>
    )
  }
  let link: ReactNode
  if (href.startsWith('#')) {
    link = (
      <a className={s.rowLink} href={href} onClick={(e) => onSectionClick(e, href)}>
        <RowBody row={row} />
      </a>
    )
  } else if (href.startsWith('/')) {
    link = (
      <Link className={s.rowLink} to={href}>
        <RowBody row={row} />
      </Link>
    )
  } else {
    link = (
      <a className={s.rowLink} href={href} target="_blank" rel="noreferrer">
        <RowBody row={row} />
        <span className={s.ext} aria-hidden="true">
          ↗
        </span>
        <span className="visually-hidden"> (새 창)</span>
      </a>
    )
  }
  return <li>{link}</li>
}

export function PlaceHero({ place, eyebrow, title, lead, meta, directory, state, screen, directoryTitle }: PlaceHeroProps) {
  const today = useToday()
  const narrow = useMediaQuery(HERO_STACK_QUERY)
  const look = buildingLook(place, today, state)
  const headerRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const plateRef = useRef<HTMLElement>(null)
  const titleId = useId()
  const rows = directory ?? []
  const hasPlate = rows.length > 0
  const layout = useHeroLayout(headerRef, stageRef, plateRef, !narrow)
  const ready = layout.stage.w > 0 && layout.stage.h > 0

  let frame: HeroFrame | null = null
  if (ready) frame = narrow ? narrowFrame(place, look.state, layout.stage) : wideFrame(place, look.state, layout.stage, hasPlate ? layout.plate : null, layout.bleed)

  const color = placeColor(place)
  const pinStyle = frame && !narrow ? ({ left: `${frame.anchor.left.toFixed(1)}px`, top: `${frame.anchor.top.toFixed(1)}px` } as CSSProperties) : undefined

  return (
    <header
      ref={headerRef}
      className={`${s.hero} ${narrow ? s.narrow : s.wide}`}
      data-place={place}
      data-state={look.state}
      style={{ '--bleed': `${layout.bleed}px`, '--c': color } as CSSProperties}
    >
      <div className={s.text}>
        <p className={s.eyebrow}>
          <span className="mark" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className={s.title}>{title}</h1>
        {lead && <p className={s.lead}>{lead}</p>}
        {meta && <p className={s.meta}>{meta}</p>}
      </div>

      <div className={s.place}>
        <div ref={stageRef} className={s.stage}>
          {frame && <HeroScene place={place} look={look} screen={screen} viewBox={viewBoxString(frame.vb)} people={!narrow} />}
          <span className={s.fadeTop} aria-hidden="true" />
        </div>
        {/* 1024 미만에서는 안내판을 그리지 않는다: 폰에서 목차 판이 첫 화면을 300px 넘게 차지했고, 같은 묶음이 바로 아래 이어진다 */}
        {hasPlate && !narrow && (
          <div className={s.pin} style={pinStyle} data-ready={frame ? '' : undefined}>
            <span className={s.foot} aria-hidden="true" />
            <span className={s.leader} aria-hidden="true" />
            <nav ref={plateRef} className={s.plate} aria-labelledby={titleId}>
              <p id={titleId} className={s.plateTitle}>
                <span className="mark" aria-hidden="true" />
                {directoryTitle ?? directoryName(place)}
              </p>
              <ul className={s.rows}>
                {rows.map((row, i) => (
                  <Row key={`${row.href ?? ''}-${i}`} row={row} />
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
