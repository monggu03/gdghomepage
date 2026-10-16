import type { SVGProps } from 'react'
import { iso, points, shade, type Point3 } from '@/lib/iso'
import s from './campus.module.css'

type PolyProps = Omit<SVGProps<SVGPolygonElement>, 'points'> & { pts: readonly Point3[] }

/** 격자 좌표로 그리는 다각형 */
export function Poly({ pts, ...rest }: PolyProps) {
  return <polygon points={points(pts)} {...rest} />
}

type LineProps = Omit<SVGProps<SVGLineElement>, 'x1' | 'y1' | 'x2' | 'y2' | 'from' | 'to'> & { from: Point3; to: Point3 }

export function IsoLine({ from, to, ...rest }: LineProps) {
  const [x1, y1] = iso(from[0], from[1], from[2] ?? 0)
  const [x2, y2] = iso(to[0], to[1], to[2] ?? 0)
  return <line x1={x1} y1={y1} x2={x2} y2={y2} {...rest} />
}

export interface BoxProps {
  x: number
  y: number
  w: number
  d: number
  z0: number
  h: number
  /** 색을 주면 면마다 밝기를 다르게, 안 주면 받침대(plinth) 색 */
  color?: string
}

/**
 * 상자 = 보이는 면 3개 (왼쪽 +y면, 오른쪽 +x면, 윗면).
 * 빛은 왼쪽 위에서 온다고 보고 윗면을 가장 밝게, 오른쪽 면을 가장 어둡게 칠한다.
 */
export function Box({ x, y, w, d, z0, h, color }: BoxProps) {
  const z1 = z0 + h
  const left: Point3[] = [[x, y + d, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x, y + d, z1]]
  const right: Point3[] = [[x + w, y, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x + w, y, z1]]
  const top: Point3[] = [[x, y, z1], [x + w, y, z1], [x + w, y + d, z1], [x, y + d, z1]]
  if (!color) {
    return (
      <>
        <Poly pts={left} className={s.plL} />
        <Poly pts={right} className={s.plR} />
        <Poly pts={top} className={s.plT} />
      </>
    )
  }
  return (
    <>
      <Poly pts={left} fill={shade(color, -0.04)} />
      <Poly pts={right} fill={shade(color, -0.2)} />
      <Poly pts={top} fill={shade(color, 0.2)} stroke={shade(color, 0.45)} strokeWidth={0.9} strokeLinejoin="round" />
      <IsoLine from={[x + w, y + d, z0]} to={[x + w, y + d, z1]} stroke={shade(color, 0.18)} strokeWidth={1} />
    </>
  )
}
