/**
 * 걷는 사람의 움직임 계산 (DOM 없음 → 테스트 가능).
 * 사람은 십자 보행로 끝에서 나타나 광장을 지나 다른 끝으로 가서 사라진다.
 * 건물 안으로 들어가지 않는다.
 */
import { GRID } from '../layout'

export type Arm = 'N' | 'S' | 'W' | 'E'
export type Vec = readonly [number, number]

/** 보행로 안 두 줄 (양방향 통행) */
export const LANES = [6.55, 7.45] as const
const ARMS: readonly Arm[] = ['N', 'S', 'W', 'E']

export interface Segment {
  a: Vec
  b: Vec
  start: number
  length: number
}

export interface Route {
  segments: Segment[]
  length: number
}

const isVertical = (arm: Arm) => arm === 'N' || arm === 'S'

/** 바닥 가장자리 점. 살짝 밖에서 시작해 서서히 나타나게 한다 */
export function edgePoint(arm: Arm, lane: number, n = GRID): Vec {
  switch (arm) {
    case 'N':
      return [lane, -0.1]
    case 'S':
      return [lane, n + 0.1]
    case 'W':
      return [-0.1, lane]
    case 'E':
      return [n + 0.1, lane]
  }
}

export function buildRoute(points: readonly Vec[]): Route {
  const segments: Segment[] = []
  let length = 0
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const l = Math.hypot(b[0] - a[0], b[1] - a[1])
    segments.push({ a, b, start: length, length: l })
    length += l
  }
  return { segments, length }
}

/** 들어올 끝과 나갈 끝을 고르고, 방향이 다르면 광장에서 한 번 꺾는다 */
export function randomRoute(rand: () => number = Math.random): Route {
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length) % list.length]
  const from = pick(ARMS)
  let to = pick(ARMS)
  while (to === from) to = ARMS[(ARMS.indexOf(to) + 1) % ARMS.length]
  const la = pick(LANES)
  const lb = pick(LANES)
  if (isVertical(from) === isVertical(to)) return buildRoute([edgePoint(from, la), edgePoint(to, la)])
  const corner: Vec = isVertical(from) ? [la, lb] : [lb, la]
  return buildRoute([edgePoint(from, la), corner, edgePoint(to, lb)])
}

/** 경로에서 t 만큼 간 위치 */
export function pointAt(route: Route, t: number): Vec {
  let seg = route.segments[0]
  for (const s of route.segments) if (t >= s.start) seg = s
  const f = seg.length === 0 ? 0 : Math.min(1, Math.max(0, (t - seg.start) / seg.length))
  return [seg.a[0] + (seg.b[0] - seg.a[0]) * f, seg.a[1] + (seg.b[1] - seg.a[1]) * f]
}

/** 처음과 끝 0.7칸 동안 서서히 나타나고 사라진다 */
export function opacityAt(route: Route, t: number, fade = 0.7): number {
  return Math.max(0, Math.min(1, t / fade, (route.length - t) / fade))
}
