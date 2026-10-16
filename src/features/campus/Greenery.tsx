import { memo } from 'react'
import { iso } from '@/lib/iso'
import { Box } from './primitives'

/** 나무 색 두 벌 (어두움 → 밝음) */
const PALETTES = [
  ['#2B7F49', '#36944F', '#43A75F', '#55BA72', '#74CF8E'],
  ['#2D7C5A', '#378F66', '#43A274', '#57B586', '#79CBA0'],
] as const
type Palette = (typeof PALETTES)[number]

/** 빛은 왼쪽 위에서 */
const LIGHT_X = -0.6
const LIGHT_Y = -0.8

const fmt = (p: ReadonlyArray<readonly [number, number]>) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ')

/** 로우폴리 수관: 바깥 육각형 조각 6개 + 가운데 윗면. 조각마다 빛 방향에 따라 밝기가 다르다 */
function Crown({ cx, cy, r, pal, rot = 0 }: { cx: number; cy: number; r: number; pal: Palette; rot?: number }) {
  const ang = (k: number) => rot + Math.PI / 6 + (k * Math.PI) / 3
  const outer: Array<[number, number]> = []
  const inner: Array<[number, number]> = []
  const icx = cx - r * 0.12
  const icy = cy - r * 0.22
  for (let k = 0; k < 6; k++) {
    outer.push([cx + r * Math.cos(ang(k)), cy + r * Math.sin(ang(k)) * 0.9])
    inner.push([icx + r * 0.45 * Math.cos(ang(k) + 0.3), icy + r * 0.4 * Math.sin(ang(k) + 0.3)])
  }
  return (
    <>
      {outer.map((_, k) => {
        const n = (k + 1) % 6
        const mx = Math.cos(ang(k) + Math.PI / 6)
        const my = Math.sin(ang(k) + Math.PI / 6)
        const tone = Math.max(0, Math.min(3, Math.round(((mx * LIGHT_X + my * LIGHT_Y + 1) / 2) * 3)))
        return <polygon key={k} points={fmt([inner[k], outer[k], outer[n], inner[n]])} fill={pal[tone]} />
      })}
      <polygon points={fmt(inner)} fill={pal[4]} />
    </>
  )
}

/** 침엽수: 원뿔 두 단, 왼쪽은 밝게 오른쪽은 어둡게 */
function Pine({ bx, by, s, pal }: { bx: number; by: number; s: number; pal: Palette }) {
  return (
    <>
      {[[7, 30, 13.5], [21, 23, 10]].map(([off, h, w]) => {
        const baseY = by - off * s
        const ay = baseY - h * s
        const my = baseY + w * s * 0.32
        return (
          <g key={off}>
            <polygon points={`${bx},${ay} ${bx - w * s},${baseY} ${bx},${my}`} fill={pal[3]} />
            <polygon points={`${bx},${ay} ${bx},${my} ${bx + w * s},${baseY}`} fill={pal[1]} />
          </g>
        )
      })}
    </>
  )
}

export const Tree = memo(function Tree({ x, y, size = 1, variant }: { x: number; y: number; size?: number; variant: number }) {
  const [bx, by] = iso(x, y, 0)
  const s = size
  const pal = PALETTES[variant % 2]
  return (
    <g>
      <ellipse cx={bx + 10 * s} cy={by + 2 * s} rx={15 * s} ry={5.5 * s} fill="rgba(40,70,60,.12)" />
      <polygon points={`${bx - 2.8 * s},${by - 1} ${bx},${by + s} ${bx},${by - 12 * s} ${bx - 2.8 * s},${by - 13 * s}`} fill="#A8865F" />
      <polygon points={`${bx},${by + s} ${bx + 2.8 * s},${by - 1} ${bx + 2.8 * s},${by - 13 * s} ${bx},${by - 12 * s}`} fill="#7E6246" />
      {variant % 3 === 2 ? (
        <Pine bx={bx} by={by} s={s} pal={pal} />
      ) : (
        <>
          <Crown cx={bx} cy={by - 25 * s} r={15.5 * s} pal={pal} rot={variant * 0.7} />
          <Crown cx={bx - 6 * s} cy={by - 35 * s} r={9 * s} pal={pal} rot={variant * 0.7 + 1} />
        </>
      )}
    </g>
  )
})

export const Bush = memo(function Bush({ x, y, variant }: { x: number; y: number; variant: number }) {
  const [bx, by] = iso(x, y, 0)
  const r = 7.5
  return (
    <g>
      <ellipse cx={bx + 5} cy={by + 1} rx={r + 3} ry={r * 0.4} fill="rgba(40,70,60,.11)" />
      <Crown cx={bx} cy={by - r * 0.6} r={r} pal={PALETTES[variant % 2]} rot={variant * 1.1} />
    </g>
  )
})

export const Bench = memo(function Bench({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Box x={x} y={y} w={0.7} d={0.24} z0={0.14} h={0.06} color="#C9A27A" />
      <Box x={x} y={y} w={0.7} d={0.05} z0={0.2} h={0.22} color="#B88C61" />
    </g>
  )
})
