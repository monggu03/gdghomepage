import { describe, expect, it } from 'vitest'
import { iso } from '@/lib/iso'
import { GRID, GROUND_FAR } from '../layout'
import { buildRoute, CORE_REACH, edgePoint, LANES, opacityAt, pointAt, randomRoute, reachFor, type Arm, type View } from './walkerEngine'

/** 정해진 순서로 값을 내는 가짜 난수 */
const seq = (...vals: number[]) => {
  let i = 0
  return () => vals[i++ % vals.length]
}

const ARMS: Arm[] = ['N', 'S', 'W', 'E']

/** 발끝이 (x, y) 인 사람 그림(폭 ±10, 키 34)이 view 와 겹치는지 */
function personVisible([x, y]: readonly [number, number], v: View): boolean {
  const [px, py] = iso(x, y, 0)
  return px + 10 > v.x && px - 10 < v.x + v.w && py > v.y && py - 34 < v.y + v.h
}

const onWalk = ([x, y]: readonly [number, number]) => (x > 6.2 && x < 7.8) || (y > 6.2 && y < 7.8)

describe('walkerEngine', () => {
  it('곧게 가는 경로와 꺾는 경로', () => {
    const straight = randomRoute(seq(0, 0.3, 0, 0)) // N → S
    expect(straight.segments).toHaveLength(1)
    const turn = randomRoute(seq(0, 0.6, 0, 0.9)) // N → W
    expect(turn.segments).toHaveLength(2)
    expect(turn.segments[0].b).toEqual([6.55, 7.45])
  })

  it('경로 위 위치', () => {
    const r = buildRoute([[0, 0], [10, 0]])
    expect(pointAt(r, 5)).toEqual([5, 0])
    expect(pointAt(r, 99)).toEqual([10, 0])
  })

  it('양 끝에서 서서히 나타나고 사라진다', () => {
    const r = buildRoute([edgePoint('W', 7), edgePoint('E', 7)])
    expect(opacityAt(r, 0)).toBe(0)
    expect(opacityAt(r, 5)).toBe(1)
    expect(opacityAt(r, r.length)).toBe(0)
  })

  it('경로는 건물 자리(보행로 밖)로 들어가지 않는다', () => {
    const reach = reachFor({ x: -900, y: -200, w: 1800, h: 700 })
    for (let i = 0; i < 50; i++) {
      for (const r of [randomRoute(), randomRoute(Math.random, reach)]) {
        for (let t = 0; t <= r.length; t += 0.25) expect(onWalk(pointAt(r, t))).toBe(true)
      }
    }
  })
})

describe('화면 밖에서 들어오기 (reachFor)', () => {
  const views: Array<[string, View]> = [
    ['데스크톱 1920×640 (배율 1.2)', { x: -800, y: -110, w: 1600, h: 533 }],
    ['노트북 1280×440 (배율 0.86)', { x: -744, y: -96, w: 1488, h: 512 }],
    ['폰 390×320 (배율 0.46)', { x: -424, y: -230, w: 848, h: 696 }],
  ]
  for (const [name, view] of views) {
    it(`${name}: 길 끝 점은 모두 화면 밖, 그러나 너무 멀지 않다`, () => {
      const reach = reachFor(view)
      for (const arm of ARMS) {
        for (const lane of LANES) {
          const p = edgePoint(arm, lane, reach)
          expect(personVisible(p, view)).toBe(false)
          // 화면 끝에서 길을 따라 2.5칸 안쪽으로 오면 보인다 (안 보이는 시간이 길지 않게)
          const back = 2.5
          const inward: [number, number] = arm === 'W' ? [p[0] + back, p[1]] : arm === 'E' ? [p[0] - back, p[1]] : arm === 'N' ? [p[0], p[1] + back] : [p[0], p[1] - back]
          expect(personVisible(inward, view)).toBe(true)
        }
      }
    })
  }

  it('땅이 그려진 곳 안에서만 걷는다', () => {
    const reach = reachFor({ x: -50000, y: -50000, w: 100000, h: 100000 })
    expect(reach.W).toBeGreaterThan(-GROUND_FAR)
    expect(reach.E).toBeLessThan(GRID + GROUND_FAR)
  })

  it('화면 크기를 모르면 가운데 칸 바로 바깥에서', () => {
    expect(CORE_REACH).toEqual({ N: -1, S: GRID + 1, W: -1, E: GRID + 1 })
  })
})
