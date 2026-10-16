import { useCallback, useMemo, useRef } from 'react'
import { CampusScene } from '../campus/CampusScene'
import { useSceneFit, type SceneLayout } from '../campus/useSceneFit'
import { PlacePanel } from '../hud/PlacePanel'
import { PlaceStrip } from '../hud/PlaceStrip'
import { ScheduleCard } from '../hud/ScheduleCard'
import { SprintTracker } from '../hud/SprintTracker'
import { headerRect } from '../layout/headerAttr'
import { useIsNarrow, useMediaQuery } from '@/hooks/useMediaQuery'
import { useOffscreen } from '@/hooks/useOffscreen'
import type { Box } from '@/lib/fit'
import { HeroIntro } from './HeroIntro'
import s from './home.module.css'

/** 건물 · 이름표와 카드 사이에 띄울 거리 (px) */
const PAD = 12
/** 첫 화면 바닥은 흰색으로 흐려지므로 건물을 이만큼 위에 둔다 (px) */
const FADE = 64
/** 이 폭 이하에서는 화면 오른쪽 장소의 이름표를 왼쪽으로 돌린다 (오른쪽 카드에 잘리지 않게) */
const FLIP_PINS_QUERY = '(max-width: 1100px)'

/**
 * 첫 화면: 소개 글 + 지도 + 지도 위 카드들.
 * 카드 배치는 여기서만 알고, 장면에는 카드 자리만 알려준다 (getLayout).
 * 장면은 건물 · 이름표가 카드에 가리지 않는 한 가장 크게 그려진다.
 */
export function HeroSection() {
  const narrow = useIsNarrow()
  const flipPins = useMediaQuery(FLIP_PINS_QUERY)
  const heroRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  // 첫 화면이 화면 밖으로 나가면 반복 애니메이션(깃발, 진행 중 표시)을 멈춘다
  const offscreen = useOffscreen(heroRef)

  const sideRef = useRef<HTMLElement>(null)
  const watch = useMemo(() => [introRef, trackRef, sideRef], [])

  const getLayout = useCallback(
    (svg: DOMRect): SceneLayout => {
      if (narrow) {
        const full = { x0: 6, y0: 6, x1: svg.width - 6, y1: svg.height - 6 }
        return { bounds: full, prefer: full, obstacles: [] }
      }
      const rel = (el: Element | null): Box | null => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x0: r.left - svg.left - PAD, y0: r.top - svg.top - PAD, x1: r.right - svg.left + PAD, y1: r.bottom - svg.top + PAD }
      }
      const header = headerRect()
      const top = header ? header.bottom - svg.top + 8 : 80
      const side = rel(sideRef.current)
      // 오른쪽 카드 줄은 세로 전체를 한 덩어리로 본다: 장소마다 패널 높이가 달라도 지도가 흔들리지 않게
      const sideBand = side && { x0: side.x0, y0: 0, x1: svg.width, y1: svg.height }
      const fade = { x0: 0, y0: svg.height - FADE, x1: svg.width, y1: svg.height }
      const obstacles = [sideBand, rel(introRef.current), rel(trackRef.current), fade].filter((b): b is Box => b !== null)
      return {
        // 땅은 카드 밑으로 들어가도 된다. 건물 · 이름표만 카드를 피한다
        bounds: { x0: 8, y0: top, x1: svg.width - 8, y1: svg.height - 8 },
        prefer: { x0: 24, y0: top, x1: sideBand ? sideBand.x0 : svg.width - 24, y1: svg.height - 16 },
        obstacles,
      }
    },
    [narrow],
  )
  const fit = useSceneFit(svgRef, getLayout, { narrow, flipPins, showLive: !flipPins, watch })

  return (
    <section ref={heroRef} className={s.hero} aria-labelledby="hero-title" data-paused={offscreen || undefined}>
      <div className={`${s.blob} ${s.blobBlue}`} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className={`${s.blob} ${s.blobCoral}`} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div ref={introRef} className={s.introWrap}>
        <HeroIntro titleId="hero-title" />
      </div>
      <CampusScene
        svgRef={svgRef}
        className={s.scene}
        viewBox={fit.viewBox}
        pinScale={fit.pinScale}
        flipRightPins={flipPins}
        compactPins={flipPins}
        walkers={narrow ? 4 : 7}
      />
      {narrow && (
        <div className={s.strip}>
          <PlaceStrip />
        </div>
      )}
      <aside ref={sideRef} className={s.side} aria-label="장소 미리보기와 일정">
        <div className={s.placeWrap}>
          <PlacePanel />
        </div>
        <div className={s.schedWrap}>
          <ScheduleCard />
        </div>
      </aside>
      <div ref={trackRef} className={s.track}>
        <SprintTracker />
      </div>
    </section>
  )
}
