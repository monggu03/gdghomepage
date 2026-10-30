import { useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { PLACES } from '@/config/places'
import type { PlaceId } from '@/domain/types'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { depthOfBox, depthOfPoint, iso } from '@/lib/iso'
import { useCampus, useCampusActions } from '@/state/useCampus'
import { Building } from './Building'
import { FlagPlaza } from './FlagPlaza'
import { signAlign } from './geometry'
import { Bench, Tree } from './Greenery'
import { Ground } from './Ground'
import { BENCHES, FLAG_AT, TREES } from './layout'
import { Sign } from './Sign'
import { useWalkers } from './walkers/useWalkers'
import { PEEP_DEFS } from './peeps/peepArt'
import { BenchSitter } from './peeps/BenchSitter'
import { PenLayer } from './PenLayer'
import s from './campus.module.css'

interface Props {
  /** 고른 장소를 강조할지. 미리보기가 닫혀 있을 때는 꺼서, 처음 들어왔을 때 안내판이 뒤집혀 보이지 않게 한다 */
  highlightSelected?: boolean
  svgRef: RefObject<SVGSVGElement | null>
  viewBox: string
  /** 안내판 확대 배율 (useSceneFit 이 돌려준 pinScale). 장면이 작아져도 글자가 13px 아래로 내려가지 않게 */
  pinScale: number
  /** pinScale 의 새 이름. 주면 이 값을 쓴다 */
  labelScale?: number
  /** 오른쪽 장소의 안내판을 왼쪽으로 펼친다 (화면 오른쪽 끝에 잘리지 않게) */
  flipRightPins: boolean
  /** 폰: 지시선 · 여백이 짧은 작은 안내판 (가리는 것은 없다) */
  compactPins?: boolean
  /** 걷는 사람 수 (데스크톱 6, 폰 2) */
  walkers?: number
  className?: string
}

interface StaticItem {
  key: string
  depth: number
  node: ReactNode
}

/**
 * 캠퍼스 지도.
 * - 땅 → 정적 물체(건물 · 나무 · 깃발, 앞뒤 순서대로) → 안내판 순서로 쌓는다
 * - 선택 · 호버 · 검색 상태는 CampusState 에서 읽는다 (메뉴 · 패널과 공유)
 * - 사람은 useWalkers 가 정적 물체 사이에 직접 끼워 넣는다
 */
export function CampusScene({ svgRef, viewBox, pinScale, labelScale, flipRightPins, compactPins = false, walkers = 6, highlightSelected = true, className = '' }: Props) {
  const { selected, hovered, hits } = useCampus()
  const { select, hover } = useCampusActions()
  const reduceMotion = useReducedMotion()
  const worldRef = useRef<SVGGElement>(null)
  // 마우스를 올린 건물의 화면 x (사람들이 그쪽을 돌아본다)
  const hoverFp = hovered ? PLACES.find((p) => p.id === hovered)?.footprint : undefined
  const focusX = hoverFp ? iso(hoverFp.x + hoverFp.w / 2, hoverFp.y + hoverFp.d / 2)[0] : null
  useWalkers(worldRef, walkers, !reduceMotion, focusX)

  const searching = hits !== null
  const isHit = (id: PlaceId) => searching && (hits?.[id] ?? 0) > 0
  const isDim = (id: PlaceId) => searching && !isHit(id)
  const k = labelScale ?? pinScale

  // 장소마다 바뀌는 건 selected/hovered/hit 뿐이다. 나무 · 벤치는 한 번만 만든다.
  const scenery = useMemo<StaticItem[]>(
    () => [
      ...TREES.map(([x, y, size, kind], i) => ({ key: `tree-${i}`, depth: depthOfPoint(x, y) + 0.05, node: <Tree x={x} y={y} size={size} kind={kind} /> })),
      ...BENCHES.map(([x, y, dir], i) => ({ key: `bench-${i}`, depth: depthOfPoint(x, y) + 0.9, node: <Bench x={x} y={y} dir={dir} /> })),
      // 벤치에 앉은 사람 (Open Peeps 앉은 자세). 벤치 바로 앞에 그린다
      ...BENCHES.map(([x, y, dir], i) => ({ key: `sitter-${i}`, depth: depthOfPoint(x, y) + 0.95, node: <BenchSitter x={x} y={y} dir={dir} pose={i === 0 ? 'sitA' : 'sitB'} /> })),
    ],
    [],
  )

  const statics: StaticItem[] = [
    ...scenery,
    ...PLACES.map((place): StaticItem => {
      const common = {
        place,
        selected: highlightSelected && selected === place.id,
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
    <svg
      ref={svgRef}
      className={`${s.scene} campus-iso ${className}`}
      viewBox={viewBox}
      preserveAspectRatio="xMinYMin meet"
      role="group"
      aria-label="GDGoC DGU 캠퍼스 지도. 건물이나 광장 깃발을 고르면 미리보기가 열립니다"
    >
      <defs dangerouslySetInnerHTML={{ __html: PEEP_DEFS }} />
      <Ground />
      <g ref={worldRef}>
        {statics.map((it) => (
          <g key={it.key} data-depth={it.depth.toFixed(2)}>
            {it.node}
          </g>
        ))}
      </g>
      <g>
        {PLACES.map((place) => (
          <Sign
            key={place.id}
            place={place}
            scale={k}
            align={signAlign(place, flipRightPins)}
            compact={compactPins}
            active={(highlightSelected && selected === place.id) || hovered === place.id}
            hit={isHit(place.id)}
            dim={isDim(place.id)}
            count={hits?.[place.id] ?? 0}
            onSelect={select}
            onHover={hover}
          />
        ))}
      </g>
      {/* 손글씨 층: 실제 일정 · 숫자만 펜으로 적는다 (지도 위 맨 앞) */}
      <PenLayer compact={compactPins} animate={!reduceMotion} scale={compactPins ? Math.min(1.5, Math.max(1, k * 0.8)) : 1} />
    </svg>
  )
}
