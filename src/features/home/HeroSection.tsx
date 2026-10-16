import { useCallback, useRef } from 'react'
import { CampusScene } from '../campus/CampusScene'
import { useSceneFit, type FreeArea } from '../campus/useSceneFit'
import { PlacePanel } from '../hud/PlacePanel'
import { PlaceStrip } from '../hud/PlaceStrip'
import { ScheduleCard } from '../hud/ScheduleCard'
import { SprintTracker } from '../hud/SprintTracker'
import { StatsCard } from '../hud/StatsCard'
import { useIsNarrow } from '@/hooks/useMediaQuery'
import s from './home.module.css'

/**
 * 첫 화면: 지도 + 지도 위 카드들.
 * 카드 배치는 여기서만 알고, 장면에는 '빈 자리'만 알려준다 (getFree).
 */
export function HeroSection() {
  const narrow = useIsNarrow()
  const svgRef = useRef<SVGSVGElement>(null)
  const placeRef = useRef<HTMLDivElement>(null)

  const getFree = useCallback(
    (svg: DOMRect): FreeArea => {
      if (narrow) return { x0: 6, y0: 6, x1: svg.width - 6, y1: svg.height - 6 }
      const panel = placeRef.current?.getBoundingClientRect()
      const header = document.querySelector('[data-site-header] > div')?.getBoundingClientRect()
      return {
        x0: 24,
        x1: panel ? panel.left - svg.left - 20 : svg.width - 24,
        y0: header ? header.bottom - svg.top + 10 : 90,
        y1: svg.height - 40, // 아래 G-Sprint 카드에 지원센터가 덜 가리게 살짝 올린다
      }
    },
    [narrow],
  )
  const fit = useSceneFit(svgRef, getFree, narrow)

  return (
    <section className={s.hero} aria-label="GDGoC DGU 캠퍼스 지도">
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
      <CampusScene svgRef={svgRef} className={s.scene} viewBox={fit.viewBox} pinScale={fit.pinScale} flipRightPins={narrow} />
      {narrow && (
        <div className={s.strip}>
          <PlaceStrip />
        </div>
      )}
      <div className={s.stats}>
        <StatsCard />
      </div>
      <aside className={s.side}>
        <div ref={placeRef} className={s.placeWrap}>
          <PlacePanel />
        </div>
        <div className={s.schedWrap}>
          <ScheduleCard />
        </div>
      </aside>
      <div className={s.track}>
        <SprintTracker />
      </div>
    </section>
  )
}
