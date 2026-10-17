/**
 * 걷는 사람의 움직임 계산 (DOM 없음 → 테스트 가능).
 * 사람은 화면 밖에서 십자 보행로를 따라 들어와, 광장을 지나 다른 쪽 화면 밖으로 나간다.
 * 건물 안으로 들어가지 않는다.
 */
import { TILE_H, TILE_W } from '@/lib/iso'
import { GRID, GROUND_FAR, PLAZA } from '../layout'

export type Arm = 'N' | 'S' | 'W' | 'E'
export type Vec = readonly [number, number]

/** 보행로 안 두 줄 (양방향 통행) */
export const LANES = [6.55, 7.45] as const
const ARMS: readonly Arm[] = ['N', 'S', 'W', 'E']

/**
 * 길마다 사람이 나타나고 사라지는 자리 (격자 좌표, 길을 따라 잰 값).
 * N · S 는 y 값 (x 방향 길이 아니라 y 방향 길), W · E 는 x 값.
 */
export type Reach = Readonly<Record<Arm, number>>

/** 화면 크기를 모를 때: 가운데 칸 끝에서 조금 밖 */
export const CORE_REACH: Reach = { N: -1, S: GRID + 1, W: -1, E: GRID + 1 }

/** SVG viewBox (보이는 자리) */
export interface View {
  x: number
  y: number
  w: number
  h: number
}

/** 사람 그림이 발끝에서 옆 · 위로 차지하는 크기 (SVG 단위) */
const PERSON_HALF_W = 10
const PERSON_H = 34
/** 두 줄 사이 거리의 절반: 바깥 줄까지 화면 밖이 되게 */
const LANE_SPREAD = (LANES[1] - LANES[0]) / 2
const LANE_MID = (LANES[0] + LANES[1]) / 2

/**
 * 보이는 자리(view) 바로 바깥에서 나타나고 사라지도록, 길마다 끝 자리를 계산한다.
 * 화면이 넓든 좁든 사람은 '화면 끝 너머'에서 걸어 들어온다. 너무 멀리서 시작하면 안 보이는 시간이 길어진다.
 */
export function reachFor(view: View, margin = 0.6): Reach {
  const hw = TILE_W / 2
  const hh = TILE_H / 2
  const c = LANE_MID
  const left = view.x - PERSON_HALF_W
  const right = view.x + view.w + PERSON_HALF_W
  const topY = view.y
  const bottomY = view.y + view.h + PERSON_H
  const out = margin + LANE_SPREAD
  // 각 길에서 화면 왼쪽/오른쪽/위/아래 끝을 넘는 첫 자리 (식은 iso() 를 거꾸로 푼 것)
  const W = Math.max(c + left / hw, topY / hh - c) - out
  const E = Math.min(c + right / hw, bottomY / hh - c) + out
  const N = Math.max(c - right / hw, topY / hh - c) - out
  const S = Math.min(c - left / hw, bottomY / hh - c) + out
  const near = PLAZA[0] - 1
  const far = PLAZA[2] + 1
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  return {
    W: clamp(W, -GROUND_FAR + 1, near),
    N: clamp(N, -GROUND_FAR + 1, near),
    E: clamp(E, far, GRID + GROUND_FAR - 1),
    S: clamp(S, far, GRID + GROUND_FAR - 1),
  }
}

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

/** 길 끝 점 */
export function edgePoint(arm: Arm, lane: number, reach: Reach = CORE_REACH): Vec {
  switch (arm) {
    case 'N':
      return [lane, reach.N]
    case 'S':
      return [lane, reach.S]
    case 'W':
      return [reach.W, lane]
    case 'E':
      return [reach.E, lane]
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
export function randomRoute(rand: () => number = Math.random, reach: Reach = CORE_REACH): Route {
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length) % list.length]
  const from = pick(ARMS)
  let to = pick(ARMS)
  while (to === from) to = ARMS[(ARMS.indexOf(to) + 1) % ARMS.length]
  const la = pick(LANES)
  const lb = pick(LANES)
  if (isVertical(from) === isVertical(to)) return buildRoute([edgePoint(from, la, reach), edgePoint(to, la, reach)])
  const corner: Vec = isVertical(from) ? [la, lb] : [lb, la]
  return buildRoute([edgePoint(from, la, reach), corner, edgePoint(to, lb, reach)])
}

/** 경로에서 t 만큼 간 위치 */
export function pointAt(route: Route, t: number): Vec {
  let seg = route.segments[0]
  for (const s of route.segments) if (t >= s.start) seg = s
  const f = seg.length === 0 ? 0 : Math.min(1, Math.max(0, (t - seg.start) / seg.length))
  return [seg.a[0] + (seg.b[0] - seg.a[0]) * f, seg.a[1] + (seg.b[1] - seg.a[1]) * f]
}

/** 처음과 끝 0.7칸 동안 서서히 나타나고 사라진다 (화면 밖이라 보통은 보이지 않는 안전장치) */
export function opacityAt(route: Route, t: number, fade = 0.7): number {
  return Math.max(0, Math.min(1, t / fade, (route.length - t) / fade))
}
