import { memo } from 'react'
import { iso } from '@/lib/iso'
import { GRASS, GRID as N, PLAZA, WALK_BAND } from './layout'
import { Poly } from './primitives'
import s from './campus.module.css'

/** 바닥판 + 잔디 + 십자 보행로 + 광장. 한 번 그리면 바뀌지 않는다 */
export const Ground = memo(function Ground() {
  const [w0, w1] = WALK_BAND
  const [px0, py0, px1, py1] = PLAZA
  const [cx, cy] = iso((px0 + px1) / 2, (py0 + py1) / 2)
  const edge = [[0, N], [N, N], [N, 0]].map(([a, b]) => iso(a, b).join(',')).join(' ')
  return (
    <g>
      <Poly className={s.gndL} pts={[[0, N, -0.6], [N, N, -0.6], [N, N, 0], [0, N, 0]]} />
      <Poly className={s.gndR} pts={[[N, 0, -0.6], [N, N, -0.6], [N, N, 0], [N, 0, 0]]} />
      <Poly className={s.gndT} pts={[[0, 0], [N, 0], [N, N], [0, N]]} />
      <polyline className={s.gndEdge} points={edge} fill="none" strokeWidth={1.6} />
      {GRASS.map(([a, b, c, d]) => (
        <Poly key={`${a}-${b}`} className={s.grass} strokeWidth={1.5} pts={[[a, b], [c, b], [c, d], [a, d]]} />
      ))}
      <Poly className={s.walk} pts={[[0, w0], [N, w0], [N, w1], [0, w1]]} />
      <Poly className={s.walk} pts={[[w0, 0], [w1, 0], [w1, N], [w0, N]]} />
      <Poly className={s.plaza} strokeWidth={1.5} pts={[[px0, py0], [px1, py0], [px1, py1], [px0, py1]]} />
      {/* 격자 r칸짜리 원은 화면에서 가로 r·45.25, 세로 r·22.63 타원 */}
      {[[1.55, 1.5], [0.75, 1.2]].map(([r, sw]) => (
        <ellipse key={r} className={s.plazaRing} cx={cx} cy={cy} rx={r * 45.25} ry={r * 22.63} strokeWidth={sw} />
      ))}
    </g>
  )
})
