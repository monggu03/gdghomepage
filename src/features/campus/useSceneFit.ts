import { useLayoutEffect, useState, type RefObject } from 'react'
import { fitAvoiding, pinScaleFor, type Box, type FitResult } from '@/lib/fit'
import { sceneTargets } from './geometry'
import { SCENE_BOUNDS, SCENE_BOUNDS_NARROW } from './layout'

const NO_WATCH: ReadonlyArray<RefObject<Element | null>> = []

/** 장면 바깥(카드 배치)을 아는 쪽이 알려주는 자리 정보. 모두 SVG 요소 기준 px */
export interface SceneLayout {
  /** 장면 경계(땅 전체)가 들어가야 하는 자리 */
  bounds: Box
  /** 장면 가운데를 되도록 맞출 자리 */
  prefer: Box
  /** 장면 위에 떠 있는 카드들. 건물 · 이름표는 여기에 가리지 않게 놓는다 */
  obstacles: Box[]
}

export interface SceneFitOptions {
  narrow: boolean
  /** 오른쪽 장소 이름표를 왼쪽으로 돌리는지 */
  flipPins: boolean
  /** 이름표에 '진행 중' 표시를 보이는지 */
  showLive: boolean
  /** 크기가 바뀌면 다시 맞출 카드들 (글꼴을 받거나 내용이 바뀌어 카드 높이가 달라질 때). 렌더마다 새 배열을 넘기지 않는다 */
  watch?: ReadonlyArray<RefObject<Element | null>>
}

/**
 * 화면 크기가 바뀔 때마다 장면을 다시 놓는다.
 * 카드 위치는 getLayout 으로 받고, 건물 · 이름표가 카드에 가리지 않는 한 가장 크게 그린다 (lib/fit.ts 의 fitAvoiding).
 * → 장면은 카드가 무엇인지 몰라도 되고, 카드 배치를 바꿔도 장면 코드는 그대로다.
 */
export function useSceneFit(
  svgRef: RefObject<SVGSVGElement | null>,
  getLayout: (svgRect: DOMRect) => SceneLayout,
  { narrow, flipPins, showLive, watch = NO_WATCH }: SceneFitOptions,
): FitResult & { pinScale: number } {
  const [fit, setFit] = useState<FitResult>(() => {
    const b = narrow ? SCENE_BOUNDS_NARROW : SCENE_BOUNDS
    return { viewBox: `${b.x} ${b.y} ${b.w} ${b.h}`, scale: 1 }
  })

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    let raf = 0
    const run = () => {
      const rect = svg.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      setFit(
        fitAvoiding({
          bbox: narrow ? SCENE_BOUNDS_NARROW : SCENE_BOUNDS,
          frame: { w: rect.width, h: rect.height },
          ...getLayout(rect),
          targets: (s) => sceneTargets({ pinScale: pinScaleFor(s), flip: flipPins, showLive }),
        }),
      )
    }
    const queue = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(run)
    }
    run()
    const ro = new ResizeObserver(queue)
    ro.observe(svg)
    for (const r of watch) if (r.current) ro.observe(r.current)
    window.addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', queue)
    }
  }, [svgRef, getLayout, narrow, flipPins, showLive, watch])

  return { ...fit, pinScale: pinScaleFor(fit.scale) }
}
