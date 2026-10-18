import { shade, type Point3 } from '@/lib/iso'
import { IsoLine, Poly } from '../primitives'
import { ROOF_RISE, SAW_TEETH } from './heights'
import { GLASS, LIT, type RoofProps } from './types'
import s from '../campus.module.css'

const RISE = ROOF_RISE.saw

/**
 * 톱니 지붕: 무언가를 만드는 작업실 · 공장 느낌.
 * 비탈은 앞(+y)으로 올라가고, 꼭대기에서 수직 유리창(톱니창)이 보는 사람 쪽을 향한다.
 * live(G-Sprint 진행 중)면 톱니창에 따뜻한 불이 켜져 있다. 깜빡이지 않는다.
 */
export function SawtoothRoof({ fp, color, top, live, glass: off = GLASS }: RoofProps) {
  const { x, y, w, d } = fp
  const p = d / SAW_TEETH
  const glass = live ? LIT.L : off.L
  const frame = shade(color, -0.12)
  return (
    <>
      {Array.from({ length: SAW_TEETH }, (_, k) => {
        const a = y + k * p
        const e = a + p
        // 톱니창 면(y = e) 위의 점
        const G = (u: number, z: number): Point3 => [u, e + 0.004, z]
        return (
          <g key={k}>
            {/* 비탈 (장소색) */}
            <Poly pts={[[x, a, top], [x + w, a, top], [x + w, e, top + RISE], [x, e, top + RISE]]} fill={shade(color, 0.08)} />
            {/* 톱니창: 장소색 틀 + 유리 */}
            <Poly pts={[[x, e, top], [x + w, e, top], [x + w, e, top + RISE], [x, e, top + RISE]]} fill={frame} />
            <Poly data-lit={live || undefined} pts={[G(x + 0.08, top + 0.08), G(x + w - 0.08, top + 0.08), G(x + w - 0.08, top + RISE - 0.07), G(x + 0.08, top + RISE - 0.07)]} fill={glass} />
            {[1, 2].map((m) => (
              <IsoLine key={m} from={G(x + (w * m) / 3, top + 0.08)} to={G(x + (w * m) / 3, top + RISE - 0.07)} stroke={frame} strokeWidth={1.2} />
            ))}
            {/* 오른쪽 끝 벽 (중립색) */}
            <Poly className={`${s.wallR} ${s.edge}`} pts={[[x + w, a, top], [x + w, e, top + RISE], [x + w, e, top]]} />
          </g>
        )
      })}
    </>
  )
}
