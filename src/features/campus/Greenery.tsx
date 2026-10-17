import { memo } from 'react'
import { iso } from '@/lib/iso'
import type { TreeKind } from './layout'
import { Box } from './primitives'
import s from './campus.module.css'

/**
 * 나무 한 그루. 둥근 나무는 수관 하나 + 왼쪽 위 밝은 면, 뾰족한 나무는 왼쪽(밝음) · 오른쪽(어두움) 두 쪽.
 * 조각을 잘게 나누지 않아서 화면이 조용하고, 노드 수도 적다 (그루당 4~5개).
 */
export const Tree = memo(function Tree({ x, y, size = 1, kind }: { x: number; y: number; size?: number; kind: TreeKind }) {
  const [bx, by] = iso(x, y, 0)
  const k = size
  const f = (n: number) => n.toFixed(1)
  return (
    <g>
      <ellipse className={s.treeShadow} cx={bx + 7 * k} cy={by + 1.5 * k} rx={11 * k} ry={4.2 * k} />
      <rect className={s.trunk} x={bx - 1.3 * k} y={by - 9 * k} width={2.6 * k} height={9 * k + 0.5} />
      {kind === 'round' ? (
        <>
          <ellipse className={s.crown} cx={bx} cy={by - 19 * k} rx={12 * k} ry={13 * k} />
          <ellipse className={s.crownLit} cx={bx - 3.6 * k} cy={by - 22.6 * k} rx={6.8 * k} ry={7.4 * k} />
        </>
      ) : (
        <>
          <polygon className={s.crownLit} points={`${f(bx)},${f(by - 38 * k)} ${f(bx - 11 * k)},${f(by - 7.5 * k)} ${f(bx)},${f(by - 4 * k)}`} />
          <polygon className={s.crownShade} points={`${f(bx)},${f(by - 38 * k)} ${f(bx)},${f(by - 4 * k)} ${f(bx + 11 * k)},${f(by - 7.5 * k)}`} />
        </>
      )}
    </g>
  )
})

const BENCH = '#bfae95'
const LEG = '#8c8478'

/**
 * 벤치: 다리 둘 + 앉는 판 + 등받이. dir 은 긴 쪽 방향.
 * 등받이를 먼 쪽(-y 또는 -x)에 두어, 보는 사람에게 앉는 판이 보이게 한다.
 */
export const Bench = memo(function Bench({ x, y, dir }: { x: number; y: number; dir: 'x' | 'y' }) {
  const L = 0.7
  const D = 0.22
  const [w, d] = dir === 'x' ? [L, D] : [D, L]
  const legs: Array<[number, number]> = dir === 'x' ? [[x + 0.06, y + 0.06], [x + L - 0.12, y + 0.06]] : [[x + 0.06, y + 0.06], [x + 0.06, y + L - 0.12]]
  return (
    <g>
      {legs.map(([lx, ly]) => (
        <Box key={`${lx}-${ly}`} x={lx} y={ly} w={dir === 'x' ? 0.06 : 0.1} d={dir === 'x' ? 0.1 : 0.06} z0={0} h={0.13} color={LEG} />
      ))}
      <Box x={x} y={y} w={dir === 'x' ? L : 0.05} d={dir === 'x' ? 0.05 : L} z0={0.13} h={0.24} color={BENCH} />
      <Box x={x} y={y} w={w} d={d} z0={0.13} h={0.05} color={BENCH} />
    </g>
  )
})
