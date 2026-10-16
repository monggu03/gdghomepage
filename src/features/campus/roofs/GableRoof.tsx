import { shade, type Point3 } from '@/lib/iso'
import { IsoLine, Poly } from '../primitives'
import { ROOF_RISE } from './heights'
import { GLASS_L, type RoofProps } from './types'

const RISE = ROOF_RISE.gable
const EAVE = 0.14

/** 박공지붕 집 + 둥근 창 + 차양: 처음 오는 사람을 맞는 안내소 느낌 */
export function GableRoof({ fp, color, top, doorCenter }: RoofProps) {
  const { x, y, w, d } = fp
  const xc = x + w / 2
  const o = EAVE
  const ring: Point3[] = Array.from({ length: 16 }, (_, i) => {
    const f = (Math.PI * 2 * i) / 16
    return [xc + 0.2 * Math.cos(f), y + d + 0.012, top + 0.36 + 0.2 * Math.sin(f)]
  })
  return (
    <>
      <Poly pts={[[x, y + d + 0.005, top], [x + w, y + d + 0.005, top], [xc, y + d + 0.005, top + RISE]]} fill={shade(color, -0.04)} />
      <Poly pts={ring} fill={GLASS_L} stroke={shade(color, 0.55)} strokeWidth={1.2} />
      <Poly
        pts={[[x - o, y - o, top - 0.07], [xc, y - o, top + RISE], [xc, y + d + o, top + RISE], [x - o, y + d + o, top - 0.07]]}
        fill={shade(color, 0.3)}
        stroke={shade(color, 0.5)}
        strokeWidth={0.9}
        strokeLinejoin="round"
      />
      <Poly pts={[[xc, y - o, top + RISE], [x + w + o, y - o, top - 0.07], [x + w + o, y + d + o, top - 0.07], [xc, y + d + o, top + RISE]]} fill={shade(color, -0.1)} />
      <IsoLine from={[xc, y - o, top + RISE]} to={[xc, y + d + o, top + RISE]} stroke={shade(color, 0.55)} strokeWidth={2} strokeLinecap="round" />
      {/* 문 위 차양 (문이 왼쪽 면에 있을 때) */}
      {fp.door === 'L' && (
        <Poly
          pts={[[doorCenter - 0.54, y + d + 0.02, 0.9], [doorCenter + 0.54, y + d + 0.02, 0.9], [doorCenter + 0.54, y + d + 0.36, 0.76], [doorCenter - 0.54, y + d + 0.36, 0.76]]}
          fill="#FFFFFF"
          stroke={shade(color, 0.5)}
        />
      )}
    </>
  )
}

