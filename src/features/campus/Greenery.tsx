import { memo } from 'react'
import { iso } from '@/lib/iso'
import type { TreeKind } from './layout'
import { cone, cyl, ring, slab, sphere, type Plan } from './anatomy/kit'
import { Line, Solid, type Paint } from './anatomy/draw'
import s from './campus.module.css'

/** 수관: 잔디(--scene-grass)보다 진하고 장소색 초록(--place-recruits)과는 다른 차분한 초록, 네 단 */
const CROWN: Paint = { top: 'var(--c-crown-top)', shades: ['var(--c-crown-0)', 'var(--c-crown-1)', 'var(--c-crown-2)', 'var(--c-crown-3)'], edge: 'var(--c-crown-edge)' }
const BARK: Paint = { top: 'var(--c-bark-top)', shades: ['var(--c-bark-0)', 'var(--c-bark-1)', 'var(--c-bark-2)', 'var(--c-bark-3)'], edge: 'var(--c-bark-edge)' }

/**
 * 나무 한 그루 (anatomy 방식): 땅 그림자 · 심은 자리 고리 → 줄기(원기둥) → 수관(공 또는 원뿔, 빛 쪽 네 단).
 * 공은 anatomy sphereOf 처럼 빛 쪽 구면 모자 네 장으로 매끈하게 칠한다.
 */
export const Tree = memo(function Tree({ x, y, size = 1, kind }: { x: number; y: number; size?: number; kind: TreeKind }) {
  const [bx, by] = iso(x, y, 0)
  const k = size
  return (
    <g>
      <ellipse className={s.treeShadow} cx={bx + 7 * k} cy={by + 1.5 * k} rx={11 * k} ry={4.2 * k} />
      <Line d={ring(x, y, 0.11 * k, 0, 14)} tone="faint" />
      {kind === 'round' ? (
        <>
          <Solid paths={cyl(x, y, 0.032 * k, 0, 0.36 * k, 8)} paint={BARK} crease="none" />
          <Solid paths={sphere([x, y, 0.6 * k], 0.28 * k, 24)} paint={CROWN} />
        </>
      ) : (
        <>
          <Solid paths={cyl(x, y, 0.03 * k, 0, 0.2 * k, 10)} paint={BARK} crease="none" />
          <Solid paths={cone(x, y, 0.24 * k, 0.125 * k, 1.06 * k, 16)} paint={CROWN} />
        </>
      )}
    </g>
  )
})

const WOOD: Paint = { top: 'var(--c-wood-top)', shades: ['var(--c-wood-0)', 'var(--c-wood-1)', 'var(--c-wood-2)', 'var(--c-wood-3)'], edge: 'var(--c-wood-edge)' }
const IRON: Paint = { top: 'var(--c-iron-top)', shades: ['var(--c-iron-0)', 'var(--c-iron-1)', 'var(--c-iron-2)', 'var(--c-iron-3)'], edge: 'var(--c-iron-edge)' }

/**
 * 벤치: 다리 둘 + 앉는 판 + 등받이 (둥근 모서리 · 깎은 윗선). dir 은 긴 쪽 방향.
 * 등받이를 먼 쪽(-y 또는 -x)에 두어, 보는 사람에게 앉는 판이 보이게 한다.
 */
export const Bench = memo(function Bench({ x, y, dir }: { x: number; y: number; dir: 'x' | 'y' }) {
  const L = 0.7
  const D = 0.22
  const [w, d] = dir === 'x' ? [L, D] : [D, L]
  const legs: Plan[] = (dir === 'x' ? [[x + 0.06, y + 0.06], [x + L - 0.12, y + 0.06]] : [[x + 0.06, y + 0.06], [x + 0.06, y + L - 0.12]]).map(([lx, ly]) => ({
    x: lx,
    y: ly,
    w: dir === 'x' ? 0.06 : 0.12,
    d: dir === 'x' ? 0.12 : 0.06,
    r: 0.01,
  }))
  const back: Plan = { x, y, w: dir === 'x' ? L : 0.05, d: dir === 'x' ? 0.05 : L, r: 0.015 }
  const seat: Plan = { x, y, w, d, r: 0.02 }
  return (
    <g>
      {legs.map((p) => (
        <Solid key={`${p.x}-${p.y}`} paths={slab(p, 0, 0.13, 2)} paint={IRON} crease="none" />
      ))}
      <Solid paths={slab(back, 0.13, 0.24, 2, 0.008)} paint={WOOD} />
      <Solid paths={slab(seat, 0.13, 0.05, 2, 0.01)} paint={WOOD} />
    </g>
  )
})
