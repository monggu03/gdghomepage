import { shade, type Point3 } from '@/lib/iso'
import { IsoLine, Poly } from '../primitives'
import { ROOF_RISE } from './heights'
import { GLASS, type RoofProps } from './types'
import s from '../campus.module.css'

const RISE = ROOF_RISE.gable
/** 처마가 벽 밖으로 나온 길이 */
const EAVE = 0.14
/** 지붕 판 두께 */
const THICK = 0.07

/**
 * 박공지붕 집 + 둥근 창 + 문 위 차양: 처음 오는 사람을 맞는 안내소 느낌.
 * 빛이 왼쪽 위에서 오므로 왼쪽 지붕면이 밝고 오른쪽 지붕면이 어둡다.
 */
export function GableRoof({ fp, color, top, doorCenter }: RoofProps) {
  const { x, y, w, d } = fp
  const xc = x + w / 2
  const o = EAVE
  const lo = top - THICK
  const front = y + d + o
  const ring: Point3[] = Array.from({ length: 14 }, (_, i) => {
    const f = (Math.PI * 2 * i) / 14
    return [xc + 0.19 * Math.cos(f), y + d + 0.01, top + 0.36 + 0.19 * Math.sin(f)]
  })
  return (
    <>
      {/* 앞 박공 벽 (중립색) + 둥근 창 */}
      <Poly className={`${s.wallL} ${s.edge}`} pts={[[x, y + d, top], [x + w, y + d, top], [xc, y + d, top + RISE]]} />
      <Poly pts={ring} fill={GLASS.L} className={s.edge} />
      {/* 지붕 두 면 (장소색) */}
      <Poly pts={[[x - o, y - o, lo], [xc, y - o, top + RISE], [xc, front, top + RISE], [x - o, front, lo]]} fill={shade(color, 0.22)} />
      <Poly pts={[[xc, y - o, top + RISE], [x + w + o, y - o, lo], [x + w + o, front, lo], [xc, front, top + RISE]]} fill={shade(color, -0.04)} />
      {/* 처마 앞 끝 두께 */}
      <Poly pts={[[x - o, front, lo], [xc, front, top + RISE], [xc, front, top + RISE - THICK], [x - o, front, lo - THICK]]} fill={shade(color, -0.14)} />
      <Poly pts={[[xc, front, top + RISE], [x + w + o, front, lo], [x + w + o, front, lo - THICK], [xc, front, top + RISE - THICK]]} fill={shade(color, -0.22)} />
      <IsoLine from={[xc, y - o, top + RISE]} to={[xc, front, top + RISE]} stroke={shade(color, 0.35)} strokeWidth={1.2} strokeLinecap="round" />
      {/* 문 위 차양 (문이 왼쪽 면에 있을 때) */}
      {fp.door === 'L' && (
        <>
          <Poly pts={[[doorCenter - 0.5, y + d, 0.9], [doorCenter + 0.5, y + d, 0.9], [doorCenter + 0.5, y + d + 0.34, 0.78], [doorCenter - 0.5, y + d + 0.34, 0.78]]} fill={shade(color, 0.1)} />
          <Poly pts={[[doorCenter - 0.5, y + d + 0.34, 0.78], [doorCenter + 0.5, y + d + 0.34, 0.78], [doorCenter + 0.5, y + d + 0.34, 0.72], [doorCenter - 0.5, y + d + 0.34, 0.72]]} fill={shade(color, -0.2)} />
        </>
      )}
    </>
  )
}
