import { useCallback, useEffect, useRef } from 'react'
import { PLACE_BY_ID } from '@/config/places'
import type { PlaceId } from '@/domain/types'
import { useIsNarrow } from '@/hooks/useMediaQuery'
import { useCampusActions } from '@/state/useCampus'
import { CampusScene } from './CampusScene'
import { useSceneFit, type SceneLayout } from './useSceneFit'

/** ?hits=projects:3,community:1 → 검색에 걸린 모습을 지도만으로 확인 */
function readHits(): Partial<Record<PlaceId, number>> | null {
  const raw = new URLSearchParams(window.location.search).get('hits')
  if (!raw) return null
  const hits: Partial<Record<PlaceId, number>> = {}
  for (const pair of raw.split(',')) {
    const [id, n] = pair.split(':')
    if (id in PLACE_BY_ID) hits[id as PlaceId] = Number(n) || 1
  }
  return hits
}

/**
 * 개발용: /__preview/campus 에서 지도만 첫 화면 크기로 띄워 본다 (카드 없이 전체 폭).
 * 데스크톱 1200–1920 × 440–640, 폰 390 × 320 정도로 첫 화면과 같은 크기.
 */
export function CampusPreview() {
  const narrow = useIsNarrow()
  const svgRef = useRef<SVGSVGElement>(null)
  const { setHits } = useCampusActions()
  useEffect(() => {
    const hits = readHits()
    if (hits) setHits(hits)
  }, [setHits])
  const getLayout = useCallback((svg: DOMRect): SceneLayout => {
    const full = { x0: 8, y0: 8, x1: svg.width - 8, y1: svg.height - 8 }
    return { bounds: full, prefer: full, obstacles: [] }
  }, [])
  const fit = useSceneFit(svgRef, getLayout, { narrow, flipPins: narrow })
  return (
    <div style={{ position: 'relative', height: narrow ? 320 : 'clamp(440px, 60vh, 640px)', overflow: 'clip' }}>
      <CampusScene svgRef={svgRef} viewBox={fit.viewBox} pinScale={fit.pinScale} labelScale={fit.labelScale} flipRightPins={narrow} compactPins={narrow} walkers={narrow ? 3 : 6} />
    </div>
  )
}
