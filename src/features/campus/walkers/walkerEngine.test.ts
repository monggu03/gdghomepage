import { describe, expect, it } from 'vitest'
import { buildRoute, edgePoint, opacityAt, pointAt, randomRoute } from './walkerEngine'

/** 정해진 순서로 값을 내는 가짜 난수 */
const seq = (...vals: number[]) => {
  let i = 0
  return () => vals[i++ % vals.length]
}

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
    for (let i = 0; i < 50; i++) {
      const r = randomRoute()
      for (let t = 0; t <= r.length; t += 0.25) {
        const [x, y] = pointAt(r, t)
        const onWalk = (x > 6.2 && x < 7.8) || (y > 6.2 && y < 7.8)
        expect(onWalk).toBe(true)
      }
    }
  })
})
