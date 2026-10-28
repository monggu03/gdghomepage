import { Fragment, useCallback, useMemo, useRef, type KeyboardEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { recruitStatus } from '@/content/recruitingStatus'
import { HERO } from '@/content/story'
import { CampusScene } from '@/features/campus/CampusScene'
import { useSceneFit, type SceneLayout } from '@/features/campus/useSceneFit'
import { usePlacePreview, usePlacePreviewState } from '@/features/layout/placePreview'
import { useIsNarrow, useMediaQuery } from '@/hooks/useMediaQuery'
import { useOffscreen } from '@/hooks/useOffscreen'
import { useToday } from '@/hooks/useToday'
import { PLACE_TRIGGER, PlacePopover } from './PlacePopover'
import { RecruitStatus } from './RecruitStatus'
import s from './hero.module.css'

export const PHONE_QUERY = '(max-width: 767px)'

/** 지도 아래쪽 이만큼은 건물 · 이름표를 두지 않는다 (사람이 화면 밖에서 걸어 들어오는 길) */
const BOTTOM_BAND = 48
/** 넓은 화면: 지도를 첫 블록 전체 배경으로 깔고 글자 판을 오른쪽에 얹는다. 그보다 좁으면 글자 → 지도 위아래 */
export const OVERLAY_QUERY = '(min-width: 1024px)'
/** 글자 판 둘레에 건물 · 이름표를 두지 않는 여백 (px) */
const PANEL_MARGIN = 80

/**
 * 첫 화면 (팀 피드백 2026-10-28 반영): 지도가 첫 블록의 배경, 오른쪽에 짧은 글자 판.
 * 글자 판 = 이름(h1, 공식 로고가 오면 그 옆) → 정식 이름 → 짧은 소개 → 주 버튼 + 두 번째 버튼 → 5기 모집 상태.
 * 지도는 이 사이트의 사이트맵이다: 건물 하나가 메뉴 하나이고, 누르면(키보드는 건물에서 Enter · Space) 그 자리에서 미리보기가 열린다 (폰은 아래 시트).
 * 넓은 화면에서는 장면을 맞출 때 글자 판 자리를 '장애물'로 넘겨서, 건물 · 안내판이 글자 판 밑에 깔리지 않고 왼쪽에 크게 놓인다.
 * 글자 판 뒤쪽 땅은 흰 바탕으로 옅게 덮어(wash) 글자가 지도 무늬 위에서도 읽히게 한다.
 * 좁은 화면(태블릿 · 폰)은 글자 판 → 지도 순서로 쌓는다.
 * 행동은 주 버튼 하나 + 두 번째 버튼 하나. 모집 상태를 따른다:
 * 모집 중이고 지원서 주소가 있으면 '지원서 쓰기 ↗' + '지원 안내 보기', 아니면 '지원 안내 보기' + '{gen}기 소식 받기 ↗'.
 */
export function HeroSection() {
  const narrow = useIsNarrow()
  const phone = useMediaQuery(PHONE_QUERY)
  const overlay = useMediaQuery(OVERLAY_QUERY)
  const today = useToday()
  // 모집 상태는 날짜로 계산한다 (오늘이 바뀌면 다시)
  const status = useMemo(() => recruitStatus(today), [today])
  const applyNow = status.state === 'open' && Boolean(status.applyUrl)
  const preview = usePlacePreview()
  // 미리보기가 열렸을 때만 고른 장소의 안내판을 뒤집는다 (처음 들어왔을 때는 모두 흰 판)
  const { open: previewOpen } = usePlacePreviewState()
  const svgRef = useRef<SVGSVGElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // 글자 판 크기가 바뀌면(글꼴을 받거나 줄이 바뀌면) 장면을 다시 맞춘다
  const watch = useMemo(() => [panelRef], [])
  // 지도가 화면 밖이면 반복 애니메이션(깃발, 진행 중 표시)을 멈춘다
  const offscreen = useOffscreen(frameRef)

  const getLayout = useCallback(
    (svg: DOMRect): SceneLayout => {
      const full = { x0: 8, y0: 8, x1: svg.width - 8, y1: svg.height - 8 }
      const band = { x0: 0, y0: svg.height - BOTTOM_BAND, x1: svg.width, y1: svg.height }
      const panel = overlay ? panelRef.current?.getBoundingClientRect() : undefined
      if (!panel || !panel.width) return { bounds: full, prefer: { ...full, y1: band.y0 }, obstacles: [band] }
      // 글자 판(+여백)은 장애물. 건물은 그 왼쪽 빈 땅 가운데를 먼저 찾는다
      const card = {
        x0: panel.left - svg.left - PANEL_MARGIN,
        y0: panel.top - svg.top - PANEL_MARGIN,
        x1: panel.right - svg.left + PANEL_MARGIN,
        y1: panel.bottom - svg.top + PANEL_MARGIN,
      }
      const prefer = { ...full, x1: Math.max(full.x0 + 240, card.x0), y1: band.y0 }
      // 흰 덮개(wash)는 글자 판 바로 왼쪽에서 시작한다. 건물은 그보다 더 왼쪽(PANEL_MARGIN)에 있으므로 덮개에 가리지 않는다
      frameRef.current?.style.setProperty('--panel-x', `${Math.round(panel.left - svg.left)}px`)
      return { bounds: full, prefer, obstacles: [band, card] }
    },
    [overlay],
  )
  const fit = useSceneFit(svgRef, getLayout, { narrow, flipPins: narrow, showLive: !narrow, watch })

  // 건물 · 이름표를 누르면(같은 장소를 다시 눌러도) 미리보기를 연다. 어떤 장소인지는 지도가 이미 골랐다
  const onMapClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest(PLACE_TRIGGER)) preview.show()
  }
  const onMapKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest(PLACE_TRIGGER)) preview.show()
  }

  return (
    <section className={s.hero} aria-labelledby="hero-title">
      {/* 글자 판이 먼저 (읽는 순서 · Tab 순서): 이름 → 소개 → 버튼 → 지도의 건물들 */}
      <div className={`container ${s.top}`}>
        <div ref={panelRef} className={s.panel}>
          <h1 id="hero-title" className={s.title}>
            {/* TODO(로고): 공식 로고 파일을 받으면 이름 앞에 둔다 (layout/BrandMark 와 같은 파일) */}
            <span className={s.wordmark}>{HERO.name}</span>
          </h1>
          <p className={s.fullName}>
            {HERO.fullName.split(/(?<=^\S+) /).map((part, i) => (
              <Fragment key={part}>
                {i > 0 && ' '}
                <span className={i > 0 ? s.keep : undefined}>{part}</span>
              </Fragment>
            ))}
          </p>
          <p className={s.lead}>
            {HERO.pitch.map((line, i) => (
              <Fragment key={line}>
                {i > 0 && ' '}
                <span className={s.leadLine}>{line}</span>
              </Fragment>
            ))}
          </p>
          {/* 주 버튼 하나 + 두 번째 버튼 하나 (DESIGN 7장). 폰에서는 둘 다 한 줄 가득 (.btn-row) */}
          <div className={`btn-row ${s.actions}`}>
            {applyNow ? (
              <a className="btn-primary" href={status.applyUrl} target="_blank" rel="noreferrer">
                지원서 쓰기<span aria-hidden="true">↗</span>
                <span className="visually-hidden"> (새 창)</span>
              </a>
            ) : (
              <Link className="btn-primary" to="/recruits">
                지원 안내 보기
              </Link>
            )}
            {applyNow ? (
              <Link className="btn-secondary" to="/recruits">
                지원 안내 보기
              </Link>
            ) : (
              <a className="btn-secondary" href={status.channelUrl} target="_blank" rel="noreferrer">
                {status.generation}기 소식 받기<span aria-hidden="true">↗</span>
                <span className="visually-hidden"> (인스타그램, 새 창)</span>
              </a>
            )}
          </div>
          {/* 지원자가 가장 먼저 궁금한 '지금 지원할 수 있나' */}
          <RecruitStatus status={status} className={s.status} />
        </div>
      </div>

      {/* 지도 = 사이트맵. 넓은 화면은 첫 블록 전체 배경, 좁은 화면은 글자 판 아래. 안의 건물 · 광장 깃발이 키보드로 고를 수 있는 버튼이다 */}
      <div ref={frameRef} className={s.map} data-paused={offscreen || undefined} onClick={onMapClick} onKeyDown={onMapKey}>
        <CampusScene
          svgRef={svgRef}
          viewBox={fit.viewBox}
          pinScale={fit.pinScale}
          flipRightPins={narrow}
          compactPins={narrow}
          walkers={phone ? 2 : 6}
          highlightSelected={previewOpen}
        />
        <div className={s.wash} aria-hidden="true" />
        <PlacePopover frameRef={frameRef} sheet={phone} />
      </div>
    </section>
  )
}
