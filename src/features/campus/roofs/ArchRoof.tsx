import { iso, shade, type Point3 } from '@/lib/iso'
import { Poly } from '../primitives'
import { ROOF_RISE } from './heights'
import { GLASS, type RoofProps } from './types'
import s from '../campus.module.css'

const RISE = ROOF_RISE.arch
const SEGMENTS = 12

/**
 * 아치 지붕 + 끝 벽 아치 창: 여럿이 모이는 체육관 · 행사장 느낌.
 * 지붕만 장소색이고 끝 벽은 오른쪽 벽과 같은 중립색이다.
 */
export function ArchRoof({ fp, color, top, glass = GLASS }: RoofProps) {
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
    // 빛이 위에서 오므로 꼭대기 쪽 띠가 밝다. 띠 사이 경계가 보이지 않게 같은 색 테두리를 준다
    const fill = shade(color, -0.1 + 0.22 * up)
    return <Poly key={i} pts={[[x, ya, za], [x + w, ya, za], [x + w, yb, zb], [x, yb, zb]]} fill={fill} stroke={fill} strokeWidth={0.6} />
  })

  // 지붕을 가로지르는 골 두 줄
  const ribs = [1 / 3, 2 / 3].map((f) => {
    const xx = x + w * f
    const line = Array.from({ length: 25 }, (_, i) => (Math.PI * i) / 24)
      .filter(facing)
      .map((th) => {
        const [yy, zz] = at(th)
        return iso(xx, yy, zz).map((v) => v.toFixed(1)).join(',')
      })
      .join(' ')
    return <polyline key={f} points={line} fill="none" stroke={shade(color, -0.2)} strokeWidth={1.2} strokeLinecap="round" />
  })

  const endWall: Point3[] = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const [yy, zz] = at((Math.PI * i) / SEGMENTS)
    return [x + w, yy, zz]
  })
  const archWindow: Point3[] = Array.from({ length: 11 }, (_, i) => {
    const th = (Math.PI * i) / 10
    return [x + w + 0.01, yc - 0.85 * Math.cos(th), top + 0.08 + 0.58 * Math.sin(th)]
  })

  return (
    <>
      {strips}
      {ribs}
      <Poly className={`${s.wallR} ${s.edge}`} pts={endWall} />
      <Poly pts={archWindow} fill={glass.R} data-glass="R" className={s.edge} />
    </>
  )
}
