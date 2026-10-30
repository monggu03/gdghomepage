import { memo } from 'react'
import { iso } from '@/lib/iso'
import { PEEPS, peepSymbolId, type PeepId } from './peepArt'

/** 걷는 사람과 같은 배율 (원본 713 높이 → 37) */
const K = 37 / 713
/** 앉은 그림에서 엉덩이 자리 (원본 좌표, 앉은 자세 365×576 기준) */
const HIP = { x: 150, y: 372 } as const
/** 벤치 앉는 판 높이 (Greenery.Bench 의 z0 0.13 + 판 0.05) */
const SEAT_Z = 0.18

/**
 * 벤치에 앉은 사람 하나 (Open Peeps 앉은 자세, CC0).
 * 원본은 오른쪽 아래(+x)를 보고 앉아 있다. x 방향 벤치는 등받이가 -y 쪽이라 사람은 +y(왼쪽 아래)를 보므로 뒤집는다.
 * 움직이지 않는다 ('동작 줄이기'와 상관없이 같은 그림).
 */
export const BenchSitter = memo(function BenchSitter({ x, y, dir, pose }: { x: number; y: number; dir: 'x' | 'y'; pose: PeepId }) {
  const art = PEEPS[pose]
  const [sx, sy] = dir === 'x' ? iso(x + 0.36, y + 0.13, SEAT_Z) : iso(x + 0.13, y + 0.36, SEAT_Z)
  const w = art.w * K
  const h = art.h * K
  const flip = dir === 'x' ? -1 : 1
  return (
    <g transform={`translate(${sx.toFixed(1)},${sy.toFixed(1)}) scale(${flip},1)`} aria-hidden="true">
      <use href={`#${peepSymbolId(pose)}`} x={(-HIP.x * K).toFixed(1)} y={(-HIP.y * K).toFixed(1)} width={w.toFixed(1)} height={h.toFixed(1)} />
    </g>
  )
})
