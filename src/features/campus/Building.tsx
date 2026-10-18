import { memo, type JSX } from 'react'
import type { Face, Footprint, Place, PlaceId } from '@/domain/types'
import { shade, type Point3 } from '@/lib/iso'
import { FLOOR, PAD } from './geometry'
import { Box, IsoLine, Poly } from './primitives'
import { PLACE_PANEL_ID } from '@/config/ui'
import { ROOFS } from './roofs'
import { GLASS } from './roofs/types'
import s from './campus.module.css'

const DOOR_HALF = 0.28
const DOOR_H = 0.62
/** 문틀 두께 */
const FRAME = 0.08
/** 창 띠: 층 높이 · 띠 높이 · 창살 간격 (격자) */
const STOREY = 0.62
const RIBBON = 0.3
const MULLION = 0.85

export interface BuildingProps {
  place: Place
  fp: Footprint
  selected: boolean
  hovered: boolean
  /** 검색에 걸림. 표시는 안내판(진한 테두리 + 건수)이 맡고, 건물은 흐려지지만 않는다 */
  hit: boolean
  dim: boolean
  onSelect: (id: PlaceId) => void
  onHover: (id: PlaceId | null) => void
}

/** 땅에 지는 그림자: 빛이 왼쪽 위에서 오므로 오른쪽(+x)으로 눕는다. 건물이 올라와도 그림자는 땅에 남는다 */
export function Shadow({ fp, rise }: { fp: Footprint; rise: number }) {
  const { x, y, w, d, h } = fp
  const L = (h + rise * 0.6) * 0.75
  const x1 = x + w + PAD
  return <Poly className={s.shadow} pts={[[x1, y + 0.2], [x1 + L, y + 0.2 + L * 0.3], [x1 + L, y + d + L * 0.3], [x1, y + d + PAD]]} />
}

export interface OpeningsProps {
  fp: Footprint
  color: string
  /** 유리 색 (생략하면 낮 유리 GLASS). 불 켜진 창 · 꺼진 창을 그릴 때 하위 페이지 장면이 바꾼다 */
  glass?: { readonly L: string; readonly R: string }
  /** closed: 문을 닫아 둔다 (어두운 문간 대신 닫힌 두 짝 문). 생략하면 열린 문간 */
  door?: 'open' | 'closed'
}

/** 층마다 유리 띠 하나 (장소색 없이). 문이 있는 면 1층은 문 자리를 비우고, 문틀만 장소색으로 */
export function Openings({ fp, color, glass = GLASS, door: doorState = 'open' }: OpeningsProps) {
  const { x, y, w, d, h, door } = fp
  const top = FLOOR + h
  const dc = door === 'L' ? x + w / 2 : y + d / 2
  const P = (f: Face, a: number, z: number): Point3 => (f === 'L' ? [a, y + d + 0.006, z] : [x + w + 0.006, a, z])
  const items: JSX.Element[] = []
  const ribbon = (f: Face, a0: number, a1: number, zz: number) => {
    if (a1 - a0 < 0.4) return
    const k = `${f}-${a0.toFixed(2)}-${zz.toFixed(2)}`
    items.push(<Poly key={k} data-glass={f} pts={[P(f, a0, zz), P(f, a1, zz), P(f, a1, zz + RIBBON), P(f, a0, zz + RIBBON)]} fill={glass[f]} />)
    // 창살은 벽색 선 (띠를 몇 칸으로 나눈다)
    const n = Math.max(1, Math.round((a1 - a0) / MULLION))
    for (let m = 1; m < n; m++) {
      const a = a0 + ((a1 - a0) * m) / n
      items.push(<IsoLine key={`${k}-${m}`} from={P(f, a, zz)} to={P(f, a, zz + RIBBON)} className={f === 'L' ? s.mullionL : s.mullionR} />)
    }
  }
  for (let zz = FLOOR + 0.3; zz + RIBBON <= top - 0.16; zz += STOREY) {
    for (const f of ['L', 'R'] as const) {
      const a0 = (f === 'L' ? x : y) + 0.26
      const a1 = (f === 'L' ? x + w : y + d) - 0.26
      if (f === door && zz < FLOOR + DOOR_H + 0.1) {
        ribbon(f, a0, dc - DOOR_HALF - FRAME - 0.16, zz)
        ribbon(f, dc + DOOR_HALF + FRAME + 0.16, a1, zz)
      } else {
        ribbon(f, a0, a1, zz)
      }
    }
  }
  const fo = DOOR_HALF + FRAME
  items.push(
    <Poly key="frame" pts={[P(door, dc - fo, FLOOR), P(door, dc + fo, FLOOR), P(door, dc + fo, FLOOR + DOOR_H + FRAME), P(door, dc - fo, FLOOR + DOOR_H + FRAME)]} fill={shade(color, door === 'L' ? 0 : -0.16)} />,
    <Poly key="door" className={doorState === 'closed' ? s.doorShut : s.door} pts={[P(door, dc - DOOR_HALF, FLOOR), P(door, dc + DOOR_HALF, FLOOR), P(door, dc + DOOR_HALF, FLOOR + DOOR_H), P(door, dc - DOOR_HALF, FLOOR + DOOR_H)]} />,
  )
  if (doorState === 'closed') {
    // 닫힌 두 짝 문: 가운데 이음매 + 손잡이 둘
    items.push(
      <IsoLine key="seam" from={P(door, dc, FLOOR)} to={P(door, dc, FLOOR + DOOR_H)} className={s.doorSeam} />,
      <IsoLine key="h1" from={P(door, dc - 0.07, FLOOR + 0.27)} to={P(door, dc - 0.07, FLOOR + 0.37)} className={s.doorHandle} />,
      <IsoLine key="h2" from={P(door, dc + 0.07, FLOOR + 0.27)} to={P(door, dc + 0.07, FLOOR + 0.37)} className={s.doorHandle} />,
    )
  }
  return <>{items}</>
}

/**
 * 건물 하나 = 그림자 + 받침 + 몸체(중립색 벽 · 유리 띠 · 문) + 지붕(장소색).
 * 지붕은 fp.roof 값으로 등록부(ROOFS)에서 꺼내 그린다.
 * 마우스를 올리거나 고르면 몸체가 4px 올라온다 (그림자는 땅에 남음).
 * memo: 자기 props 가 바뀔 때만 다시 그린다 (다른 건물을 눌러도 이 건물은 그대로).
 */
export const Building = memo(function Building({ place, fp, selected, hovered, dim, onSelect, onHover }: BuildingProps) {
  const { x, y, w, d, h } = fp
  const color = place.color
  const top = FLOOR + h
  const roof = ROOFS[fp.roof]
  const Roof = roof.Component
  const cls = [s.bld, selected && s.sel, hovered && s.hov, dim && s.dim].filter(Boolean).join(' ')

  return (
    <g
      className={cls}
      data-place={place.id}
      tabIndex={0}
      role="button"
      aria-label={`${place.label} 미리보기 열기`}
      aria-current={selected ? 'true' : undefined}
      aria-controls={PLACE_PANEL_ID}
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
      <Shadow fp={fp} rise={roof.height} />
      <g className={s.lift}>
        <Box x={x - PAD} y={y - PAD} w={w + PAD * 2} d={d + PAD * 2} z0={0} h={FLOOR} tone="pad" edge />
        <Box x={x} y={y} w={w} d={d} z0={FLOOR} h={h} tone="wall" edge />
        <Openings fp={fp} color={color} />
        <Roof fp={fp} color={color} top={top} doorCenter={fp.door === 'L' ? x + w / 2 : y + d / 2} live={place.live === true} />
      </g>
    </g>
  )
})
