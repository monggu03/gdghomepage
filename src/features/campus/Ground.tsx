import { memo } from 'react'
import { PLACES } from '@/config/places'
import { iso } from '@/lib/iso'
import { entryPath } from './geometry'
import { FLAG_AT, GRID as N, GROUND_FAR as F, LAWNS, PLAZA, WALK_BAND } from './layout'
import { Poly } from './primitives'
import s from './campus.module.css'

/**
 * 땅 + 잔디 + 문 앞 길 + 십자 보행로 + 광장. 한 번 그리면 바뀌지 않는다.
 * 받침판 없이 아주 넓은 땅 한 장을 깔아서, 화면이 장면을 어디서 자르든 땅과 길이 화면 밖으로 이어진다.
 */
export const Ground = memo(function Ground() {
  const [w0, w1] = WALK_BAND
  const [px0, py0, px1, py1] = PLAZA
  const [cx, cy] = iso(FLAG_AT[0], FLAG_AT[1])
  return (
    <g>
      <Poly className={s.ground} pts={[[-F, -F], [N + F, -F], [N + F, N + F], [-F, N + F]]} />
      {LAWNS.map(([a, b, c, d]) => (
        <Poly key={`${a}-${b}`} className={s.lawn} pts={[[a, b], [c, b], [c, d], [a, d]]} />
      ))}
      {PLACES.flatMap((p) => (p.footprint ? [entryPath(p.footprint)] : [])).map(([a, b, c, d]) => (
        <Poly key={`door-${a}-${b}`} className={s.walk} pts={[[a, b], [c, b], [c, d], [a, d]]} />
      ))}
      <Poly className={s.walk} pts={[[-F, w0], [N + F, w0], [N + F, w1], [-F, w1]]} />
      <Poly className={s.walk} pts={[[w0, -F], [w1, -F], [w1, N + F], [w0, N + F]]} />
      <Poly className={s.plaza} pts={[[px0, py0], [px1, py0], [px1, py1], [px0, py1]]} />
      {/* 격자 r칸짜리 원은 화면에서 가로 r·45.25, 세로 r·22.63 타원 */}
      <ellipse className={s.plazaRing} cx={cx} cy={cy} rx={1.45 * 45.25} ry={1.45 * 22.63} />
    </g>
  )
})
