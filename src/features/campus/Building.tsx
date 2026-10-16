import { memo, type JSX } from 'react'
import type { Face, Footprint, Place, PlaceId } from '@/domain/types'
import { shade, type Point3 } from '@/lib/iso'
import { FLOOR } from './geometry'
import { Box, IsoLine, Poly } from './primitives'
import { ROOFS } from './roofs'
import { GLASS_L, GLASS_R } from './roofs/types'
import s from './campus.module.css'

const DOOR_HALF = 0.32
const DOOR = '#2E3850'

export interface BuildingProps {
  place: Place
  fp: Footprint
  selected: boolean
  hovered: boolean
  hit: boolean
  dim: boolean
  onSelect: (id: PlaceId) => void
  onHover: (id: PlaceId | null) => void
}

/** 층마다 창 띠 하나. 문이 있는 면 1층은 문 자리를 비운다 */
function Ribbons({ fp, color }: { fp: Footprint; color: string }) {
  const { x, y, w, d, h, door } = fp
  const top = FLOOR + h
  const dc = door === 'L' ? x + w / 2 : y + d / 2
  const P = (f: Face, a: number, z: number): Point3 => (f === 'L' ? [a, y + d + 0.01, z] : [x + w + 0.01, a, z])
  const items: JSX.Element[] = []
  const ribbon = (f: Face, a0: number, a1: number, zz: number) => {
    if (a1 - a0 < 0.35) return
    const k = `${f}-${a0.toFixed(2)}-${zz.toFixed(2)}`
    items.push(
      <Poly key={k} pts={[P(f, a0, zz), P(f, a1, zz), P(f, a1, zz + 0.3), P(f, a0, zz + 0.3)]} fill={f === 'L' ? GLASS_L : GLASS_R} stroke={shade(color, 0.5)} strokeWidth={1.2} />,
    )
    for (let m = a0 + 0.75; m < a1 - 0.2; m += 0.75) {
      items.push(<IsoLine key={`${k}-${m.toFixed(2)}`} from={P(f, m, zz)} to={P(f, m, zz + 0.3)} stroke={shade(color, 0.5)} strokeWidth={1} />)
    }
  }
  for (let zz = FLOOR + 0.34; zz + 0.3 <= top - 0.14; zz += 0.6) {
    for (const f of ['L', 'R'] as const) {
      const a0 = (f === 'L' ? x : y) + 0.28
      const a1 = (f === 'L' ? x + w : y + d) - 0.28
      if (f === door && zz < FLOOR + 0.8) {
        ribbon(f, a0, dc - DOOR_HALF - 0.14, zz)
        ribbon(f, dc + DOOR_HALF + 0.14, a1, zz)
      } else {
        ribbon(f, a0, a1, zz)
      }
    }
  }
  items.push(
    <Poly key="door" pts={[P(door, dc - DOOR_HALF, FLOOR), P(door, dc + DOOR_HALF, FLOOR), P(door, dc + DOOR_HALF, FLOOR + 0.66), P(door, dc - DOOR_HALF, FLOOR + 0.66)]} fill={DOOR} />,
  )
  return <>{items}</>
}

/**
 * 건물 하나 = 그림자 + 받침대 + 몸체(벽·창·문) + 지붕.
 * 지붕은 fp.roof 값으로 등록부(ROOFS)에서 꺼내 그린다.
 * memo: 자기 props 가 바뀔 때만 다시 그린다 (다른 건물을 눌러도 이 건물은 그대로).
 */
export const Building = memo(function Building({ place, fp, selected, hovered, hit, dim, onSelect, onHover }: BuildingProps) {
  const { x, y, w, d, h } = fp
  const color = place.color
  const top = FLOOR + h
  const shadow = h * 0.8 + 0.3
  const Roof = ROOFS[fp.roof].Component
  const cls = [s.bld, selected && s.sel, hovered && s.hov, hit && s.hit, dim && s.dim].filter(Boolean).join(' ')

  return (
    <g
      className={cls}
      style={{ ['--glow' as string]: color }}
      tabIndex={0}
      role="button"
      aria-label={`${place.label} 미리보기 열기`}
      aria-pressed={selected}
      onClick={() => onSelect(place.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(place.id)
        }
      }}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(place.id)}
      onBlur={() => onHover(null)}
    >
      <Poly pts={[[x + w + 0.12, y], [x + w + 0.12 + shadow, y], [x + w + 0.12 + shadow, y + d], [x + w + 0.12, y + d]]} fill="rgba(40,55,110,.07)" />
      <Box x={x - 0.15} y={y - 0.15} w={w + 0.3} d={d + 0.3} z0={0} h={FLOOR} />
      <Box x={x} y={y} w={w} d={d} z0={FLOOR} h={h} color={color} />
      <Ribbons fp={fp} color={color} />
      <Roof fp={fp} color={color} top={top} doorCenter={fp.door === 'L' ? x + w / 2 : y + d / 2} />
    </g>
  )
})
