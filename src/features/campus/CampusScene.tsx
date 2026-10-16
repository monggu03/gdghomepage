import { useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { PLACES } from '@/config/places'
import type { PlaceId } from '@/domain/types'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { depthOfBox, depthOfPoint } from '@/lib/iso'
import { useCampus, useCampusActions } from '@/state/useCampus'
import { Building } from './Building'
import { FlagPlaza } from './FlagPlaza'
import { FLAG_PIN, pinAnchor } from './geometry'
import { Bench, Bush, Tree } from './Greenery'
import { Ground } from './Ground'
import { BENCHES, BUSHES, FLAG_AT, TREES } from './layout'
import { Pin } from './Pin'
import { useWalkers } from './walkers/useWalkers'
import s from './campus.module.css'

interface Props {
  svgRef: RefObject<SVGSVGElement | null>
  viewBox: string
  pinScale: number
  /** 폰: 오른쪽 장소의 이름표를 왼쪽으로 */
  flipRightPins: boolean
  walkers?: number
  className?: string
}

interface StaticItem {
  key: string
  depth: number
  node: ReactNode
}

/**
 * 움직이는 캠퍼스 지도.
 * - 바닥 → 정적 물체(건물·나무·깃발, 앞뒤 순서대로) → 이름표 핀 순서로 쌓는다
 * - 선택·호버·검색 상태는 CampusState 에서 읽는다 (메뉴·패널과 공유)
 * - 사람은 useWalkers 가 정적 물체 사이에 직접 끼워 넣는다
 */
export function CampusScene({ svgRef, viewBox, pinScale, flipRightPins, walkers = 7, className = '' }: Props) {
  const { selected, hovered, hits } = useCampus()
  const { select, hover } = useCampusActions()
  const reduceMotion = useReducedMotion()
  const worldRef = useRef<SVGGElement>(null)
  useWalkers(worldRef, walkers, !reduceMotion)

  const searching = hits !== null
  const isHit = (id: PlaceId) => searching && (hits?.[id] ?? 0) > 0
  const isDim = (id: PlaceId) => searching && !isHit(id)

  // 장소마다 바뀌는 건 selected/hovered/hit 뿐이다. 나무·벤치는 한 번만 만든다.
  const scenery = useMemo<StaticItem[]>(
    () => [
      ...TREES.map(([x, y, size], i) => ({ key: `tree-${i}`, depth: depthOfPoint(x, y) + 0.05, node: <Tree x={x} y={y} size={size} variant={i} /> })),
      ...BUSHES.map(([x, y], i) => ({ key: `bush-${i}`, depth: depthOfPoint(x, y), node: <Bush x={x} y={y} variant={i} /> })),
      ...BENCHES.map(([x, y], i) => ({ key: `bench-${i}`, depth: depthOfPoint(x, y) + 0.9, node: <Bench x={x} y={y} /> })),
    ],
    [],
  )

  const statics: StaticItem[] = [
    ...scenery,
    ...PLACES.map((place): StaticItem => {
      const common = {
        place,
        selected: selected === place.id,
        hovered: hovered === place.id,
        hit: isHit(place.id),
        dim: isDim(place.id),
        onSelect: select,
        onHover: hover,
      }
      if (!place.footprint) {
        return { key: place.id, depth: depthOfPoint(FLAG_AT[0], FLAG_AT[1]) + 0.4, node: <FlagPlaza {...common} /> }
      }
      const fp = place.footprint
      return { key: place.id, depth: depthOfBox(fp.x, fp.y, fp.w, fp.d), node: <Building fp={fp} {...common} /> }
    }),
  ].sort((a, b) => a.depth - b.depth)

  return (
    <svg ref={svgRef} className={`${s.scene} ${className}`} viewBox={viewBox} preserveAspectRatio="xMinYMin meet" role="group" aria-label="GDGoC DGU 캠퍼스 지도">
      <defs>
        <linearGradient id="campus-glass-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7faff" />
          <stop offset="1" stopColor="#c9d9f7" />
        </linearGradient>
        <linearGradient id="campus-glass-r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dce6fa" />
          <stop offset="1" stopColor="#afc2ea" />
        </linearGradient>
      </defs>
      <Ground />
      <g ref={worldRef}>
        {statics.map((it) => (
          <g key={it.key} data-depth={it.depth.toFixed(2)}>
            {it.node}
          </g>
        ))}
      </g>
      <g>
        {PLACES.map((place) => {
          const at = place.footprint ? pinAnchor(place.footprint) : FLAG_PIN
          return (
            <Pin
              key={place.id}
              place={place}
              at={at}
              scale={pinScale}
              flip={flipRightPins && at[0] - at[1] > 3.5}
              selected={selected === place.id}
              lifted={hovered === place.id}
              dim={isDim(place.id)}
              count={hits?.[place.id] ?? 0}
              onSelect={select}
              onHover={hover}
            />
          )
        })}
      </g>
    </svg>
  )
}

