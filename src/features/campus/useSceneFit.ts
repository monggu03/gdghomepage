import { useLayoutEffect, useState, type RefObject } from 'react'
import { fitViewBox, pinScaleFor, type FitResult } from '@/lib/fit'
import { SCENE_BOUNDS, SCENE_BOUNDS_NARROW } from './layout'

export interface FreeArea {
  x0: number
  y0: number
  x1: number
  y1: number
}

/**
 * 화면 크기가 바뀔 때마다 장면을 빈 자리에 다시 맞춘다.
 * 빈 자리는 장면 바깥(HUD 카드 배치)을 아는 쪽이 getFree 로 알려준다.
 * → 장면은 카드가 어디 있는지 몰라도 되고, 카드 배치를 바꿔도 장면 코드는 그대로다.
 */
export function useSceneFit(
  svgRef: RefObject<SVGSVGElement | null>,
  getFree: (svgRect: DOMRect) => FreeArea,
  narrow: boolean,
): FitResult & { pinScale: number } {
  const [fit, setFit] = useState<FitResult>({ viewBox: '-468 -130 936 607', scale: 1 })

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    let raf = 0
    const run = () => {
      const rect = svg.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      setFit(
        fitViewBox({
          bbox: narrow ? SCENE_BOUNDS_NARROW : SCENE_BOUNDS,
          frame: { w: rect.width, h: rect.height },
          free: getFree(rect),
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
    window.addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', queue)
    }
  }, [svgRef, getFree, narrow])

  return { ...fit, pinScale: pinScaleFor(fit.scale) }
}
