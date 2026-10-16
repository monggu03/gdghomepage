import { shade, type Point3 } from '@/lib/iso'
import { Poly } from '../primitives'
import { ROOF_RISE } from './heights'
import { GLASS_L, type RoofProps } from './types'

const TEETH = 3
const RISE = ROOF_RISE.saw

/** 톱니 지붕 + 비스듬한 채광창: 무언가를 만드는 작업실·공장 느낌 */
export function SawtoothRoof({ fp, color, top }: RoofProps) {
  const { x, y, w, d } = fp
  const p = d / TEETH
  return (
    <>
      {Array.from({ length: TEETH }, (_, k) => {
        const a = y + k * p
        const e = a + p
        const Q = (u: number, t: number): Point3 => [u, a + t * p, top + RISE * (1 - t)]
        return (
          <g key={k}>
            <Poly
              pts={[[x, a, top + RISE], [x + w, a, top + RISE], [x + w, e, top], [x, e, top]]}
              fill={shade(color, 0.22)}
              stroke={shade(color, 0.45)}
              strokeWidth={0.9}
              strokeLinejoin="round"
            />
            <Poly pts={[Q(x + 0.3, 0.1), Q(x + w - 0.3, 0.1), Q(x + w - 0.3, 0.42), Q(x + 0.3, 0.42)]} fill={GLASS_L} stroke={shade(color, 0.55)} strokeWidth={1} />
            <Poly pts={[[x + w, a, top], [x + w, a, top + RISE], [x + w, e, top]]} fill={shade(color, -0.2)} />
          </g>
        )
      })}
    </>
  )
}

