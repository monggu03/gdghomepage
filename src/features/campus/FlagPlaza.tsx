import { memo } from 'react'
import type { Place, PlaceId } from '@/domain/types'
import { iso } from '@/lib/iso'
import { FLAG_POLE as POLE } from './geometry'
import { FLAG_AT } from './layout'
import { PLACE_PANEL_ID } from '../hud/shared'
import { Box } from './primitives'
import s from './campus.module.css'

const STRIPES = ['#4285F4', '#EA4335', '#FBBC04', '#34A853']

interface Props {
  place: Place
  selected: boolean
  hovered: boolean
  hit: boolean
  dim: boolean
  onSelect: (id: PlaceId) => void
  onHover: (id: PlaceId | null) => void
}

/** 광장 한가운데 깃발 = GDGoC DGU 소개. 어느 건물에도 가리지 않는 자리 */
export const FlagPlaza = memo(function FlagPlaza({ place, selected, hovered, hit, dim, onSelect, onHover }: Props) {
  const [fx, fy] = FLAG_AT
  const [bx, by] = iso(fx, fy, 0)
  const cls = [s.bld, selected && s.sel, hovered && s.hov, hit && s.hit, dim && s.dim].filter(Boolean).join(' ')
  return (
    <g
      className={cls}
      style={{ ['--glow' as string]: '#4285f4' }}
      tabIndex={0}
      role="button"
      aria-label={`${place.label} 소개 열기`}
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
      {/* 깃대가 가늘어서 누르기 어렵다: 보이지 않는 넓은 자리를 깐다 (폰에서도 44px 이상) */}
      <rect x={bx - 30} y={by - POLE - 22} width={96} height={POLE + 34} fill="transparent" />
      <ellipse cx={bx + 5} cy={by + 2} rx={14} ry={6} fill="rgba(30,40,90,.12)" />
      <Box x={fx - 0.2} y={fy - 0.2} w={0.4} d={0.4} z0={0} h={0.16} />
      <rect x={bx - 1.6} y={by - POLE - 4} width={3.2} height={POLE} rx={1.6} fill="#7D879F" />
      <circle cx={bx} cy={by - POLE - 5} r={3} fill="#C9CFDD" />
      <g className={s.flag}>
        {STRIPES.map((c, i) => (
          <rect key={c} x={bx + 1.6} y={by - POLE - 2 + i * 7.5} width={50} height={7.5} fill={c} />
        ))}
      </g>
    </g>
  )
})
