import { Fragment, useCallback, useMemo, useRef, type KeyboardEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { SPRINT } from '@/config/site'
import { recruitStatus } from '@/content/recruitingStatus'
import { HERO } from '@/content/story'
import { CampusScene } from '@/features/campus/CampusScene'
import { useSceneFit, type SceneLayout } from '@/features/campus/useSceneFit'
import { usePlacePreview, usePlacePreviewState } from '@/features/layout/placePreview'
import { useIsNarrow, useMediaQuery } from '@/hooks/useMediaQuery'
import { useOffscreen } from '@/hooks/useOffscreen'
import { useToday } from '@/hooks/useToday'
import { isAfter } from './homeData'
import { PLACE_TRIGGER, PlacePopover } from './PlacePopover'
import { RecruitStatus } from './RecruitStatus'
import s from './hero.module.css'

export const PHONE_QUERY = '(max-width: 767px)'

/** 지도 아래쪽 이만큼은 건물 · 이름표를 두지 않는다 (사람이 화면 밖에서 걸어 들어오는 길) */
const BOTTOM_BAND = 48

/**
 * 첫 화면: 큰 한 문장(h1) | 5기 모집 상태 → 소개 한 문장 · 주 버튼 + 두 번째 버튼 → 지도(화면 끝까지).
 * 지도 위에는 아무것도 얹지 않는다. 건물 · 이름표를 누르면(키보드는 건물에서 Enter · Space) 그 자리에서 미리보기가 열린다 (폰은 아래 시트).
 * 장소 이름을 글자로 나열한 범례는 두지 않는다: 머리말 메뉴 · 폰 메뉴가 같은 장소를 이미 글자로 준다.
 * 행동은 주 버튼 하나 + 두 번째 버튼 하나. 모집 상태를 따른다:
 * 모집 중이고 지원서 주소가 있으면 '지원서 쓰기 ↗' + '지원 안내 보기', 아니면 '지원 안내 보기' + '{gen}기 소식 받기 ↗'.
 */
export function HeroSection() {
  const narrow = useIsNarrow()
  const phone = useMediaQuery(PHONE_QUERY)
  const today = useToday()
  // G-Sprint 데모데이 다음 날부터 h1 을 지난 일로
  const done = isAfter(today, SPRINT.demoDay)
  const lines = done ? HERO.title.after : HERO.title.before
  // 모집 상태는 날짜로 계산한다 (오늘이 바뀌면 다시)
  const status = useMemo(() => recruitStatus(today), [today])
  const applyNow = status.state === 'open' && Boolean(status.applyUrl)
  const preview = usePlacePreview()
  // 미리보기가 열렸을 때만 고른 장소의 안내판을 뒤집는다 (처음 들어왔을 때는 모두 흰 판)
  const { open: previewOpen } = usePlacePreviewState()
  const svgRef = useRef<SVGSVGElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  // 지도가 화면 밖이면 반복 애니메이션(깃발, 진행 중 표시)을 멈춘다
  const offscreen = useOffscreen(frameRef)

  const getLayout = useCallback((svg: DOMRect): SceneLayout => {
    const full = { x0: 8, y0: 8, x1: svg.width - 8, y1: svg.height - 8 }
    const band = { x0: 0, y0: svg.height - BOTTOM_BAND, x1: svg.width, y1: svg.height }
    return { bounds: full, prefer: { ...full, y1: band.y0 }, obstacles: [band] }
  }, [])
  const fit = useSceneFit(svgRef, getLayout, { narrow, flipPins: narrow, showLive: !narrow })

  // 건물 · 이름표를 누르면(같은 장소를 다시 눌러도) 미리보기를 연다. 어떤 장소인지는 지도가 이미 골랐다
  const onMapClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest(PLACE_TRIGGER)) preview.show()
  }
  const onMapKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest(PLACE_TRIGGER)) preview.show()
  }

  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div className={`container ${s.top}`}>
        {/* 뜻으로 끊는다: 넓은 화면에서는 묶음마다 한 줄, 폰에서는 묶음 사이에서만 줄이 바뀐다 */}
        <h1 id="hero-title" className={s.title}>
          {lines.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && ' '}
              <span className={s.phrase}>{line}</span>
            </Fragment>
          ))}
        </h1>
        {/* 예전 D-day 자리: 지원자가 가장 먼저 궁금한 '지금 지원할 수 있나' */}
        <RecruitStatus status={status} className={s.status} />
        <div className={s.intro}>
          <p className={s.lead}>{HERO.pitch}</p>
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
        </div>
      </div>

      {/* 지도는 화면 끝까지. 안의 건물 · 광장 깃발이 키보드로 고를 수 있는 버튼이다 (Tab → Enter · Space) */}
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
        <PlacePopover frameRef={frameRef} sheet={phone} />
      </div>
    </section>
  )
}
