import { iso, shade, type Point3 } from '@/lib/iso'
import { Poly } from '../primitives'
import { ROOF_RISE } from './heights'
import { GLASS_R, type RoofProps } from './types'

const RISE = ROOF_RISE.arch
const SEGMENTS = 14

/** 아치 지붕 + 끝 벽 아치 창: 여럿이 모이는 체육관·행사장 느낌 */
export function ArchRoof({ fp, color, top }: RoofProps) {
  const { x, y, w, d } = fp
  const R = d / 2
  const yc = y + R
  const at = (th: number): [number, number] => [yc - R * Math.cos(th), top + RISE * Math.sin(th)]
  // 보는 쪽(+y, 위)을 향한 면만 그린다. 뒤쪽 면은 앞쪽 면에 가려진다.
  const facing = (th: number) => -Math.cos(th) / R + Math.sin(th) / RISE > 0

  const strips = Array.from({ length: SEGMENTS }, (_, i) => {
    const t0 = (Math.PI * i) / SEGMENTS
    const t1 = (Math.PI * (i + 1)) / SEGMENTS
    const tm = (t0 + t1) / 2
    if (!facing(tm)) return null
    const ny = -Math.cos(tm) / R
    const nz = Math.sin(tm) / RISE
    const up = Math.max(0, nz / Math.hypot(ny, nz)) // 1 = 위를 봄, 0 = 앞을 봄
    const [ya, za] = at(t0)
    const [yb, zb] = at(t1)
    return <Poly key={i} pts={[[x, ya, za], [x + w, ya, za], [x + w, yb, zb], [x, yb, zb]]} fill={shade(color, -0.06 + 0.28 * up)} />
  })

  const ribs = [0.25, 0.5, 0.75].map((f) => {
    const xx = x + w * f
    const line = Array.from({ length: 29 }, (_, i) => (Math.PI * i) / 28)
      .filter(facing)
      .map((th) => {
        const [yy, zz] = at(th)
        return iso(xx, yy, zz).map((v) => v.toFixed(1)).join(',')
      })
      .join(' ')
    return <polyline key={f} points={line} fill="none" stroke={shade(color, 0.45)} strokeWidth={1.4} strokeLinecap="round" />
  })

  const endWall: Point3[] = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const [yy, zz] = at((Math.PI * i) / SEGMENTS)
    return [x + w, yy, zz]
  })
  const archWindow: Point3[] = Array.from({ length: 13 }, (_, i) => {
    const th = (Math.PI * i) / 12
    return [x + w + 0.01, yc - 0.8 * Math.cos(th), top + 0.06 + 0.6 * Math.sin(th)]
  })

  return (
    <>
      {strips}
      {ribs}
      <Poly pts={endWall} fill={shade(color, -0.2)} />
      <Poly pts={archWindow} fill={GLASS_R} stroke={shade(color, 0.35)} strokeWidth={1.2} />
    </>
  )
}

