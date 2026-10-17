import { useCallback, useRef, type KeyboardEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '@/config/site'
import { useSchedule } from '@/data/queries'
import { CampusScene } from '@/features/campus/CampusScene'
import { useSceneFit, type SceneLayout } from '@/features/campus/useSceneFit'
import { usePlacePreview, usePlacePreviewState } from '@/features/layout/placePreview'
import { useIsNarrow, useMediaQuery } from '@/hooks/useMediaQuery'
import { useOffscreen } from '@/hooks/useOffscreen'
import { useToday } from '@/hooks/useToday'
import { ddayLabel } from '@/lib/date'
import { dayLabel, nextEvent, sentences } from './homeData'
import { PLACE_TRIGGER, PlacePopover } from './PlacePopover'
import { PlaceLegend } from './PlaceLegend'
import { scrollToSection } from './scrollTo'
import s from './hero.module.css'

export const PHONE_QUERY = '(max-width: 767px)'

/** 지도 아래쪽 이만큼은 건물 · 이름표를 두지 않는다 (사람이 화면 밖에서 걸어 들어오는 길) */
const BOTTOM_BAND = 48

/**
 * 다음 일정 한 덩어리: 이름 · D-n · 날짜와 제목. h1 과 같은 줄 오른쪽에 둔다.
 * 일정을 받기 전에도 자리(min-height)를 잡아 두어 받은 뒤에 화면이 밀리지 않는다.
 * 멤버 수는 '기록' 섹션의 한 줄이 기준과 함께 맡는다.
 */
function NextUp() {
  const today = useToday()
  const { data, isPending } = useSchedule()
  const next = data ? nextEvent(data, today) : null
  return (
    <div className={s.next} data-pending={isPending || undefined}>
      {next && (
        <p className={s.nextEvent}>
          <span className={s.nextLabel}>다음 일정</span>
          <span className={`num ${s.dday}`}>{ddayLabel(next.date, today)}</span>
          <span className={s.nextTitle}>
            <span className="num">{dayLabel(next.date, today)}</span> · {next.title}
          </span>
        </p>
      )}
    </div>
  )
}

/**
 * 첫 화면: 한 줄 소개(h1) | 다음 일정 → 소개 글 · 행동 → 지도(화면 끝까지) → 장소 범례.
 * 지도 위에는 아무것도 얹지 않는다. 건물을 누르면 그 자리에서 미리보기가 열린다 (폰은 아래 시트).
 */
export function HeroSection() {
  const narrow = useIsNarrow()
  const phone = useMediaQuery(PHONE_QUERY)
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
        {/* 뜻으로 끊는다: 좁아지면 묶음(phrase) 사이에서만 줄이 바뀐다 */}
        <h1 id="hero-title" className={s.title}>
          <span className={s.phrase}>화요일마다 모여 배우고,</span>
          <br />
          <span className={s.phrase}>12월엔 직접 만든</span> <span className={s.phrase}>서비스를 배포합니다.</span>
        </h1>
        <div className={s.intro}>
          <p className={s.lead}>
            {sentences(SITE.pitch).map((line) => (
              <span key={line} className={s.sentence}>
                {line}{' '}
              </span>
            ))}
          </p>
          {/* 주 버튼은 하나: 지금 확정된 4기 일정. 5기 모집은 아직 미정이라 보조 링크로 */}
          <div className={s.actions}>
            <a
              className="btn-primary"
              href="#now"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('now')
              }}
            >
              {SITE.generation} 일정 보기
            </a>
            <Link className="link" to="/recruits">
              5기 모집 안내
            </Link>
          </div>
        </div>
        <NextUp />
      </div>

      {/* 지도는 화면 끝까지. 안의 건물이 키보드로 고를 수 있는 버튼이고, 아래 범례가 같은 메뉴를 글자로 준다 */}
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
      <PlaceLegend />
    </section>
  )
}
