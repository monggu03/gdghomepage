import { describe, expect, it } from 'vitest'
import { fitViewBox, pinScaleFor } from './fit'

describe('fitViewBox', () => {
  it('빈 자리의 짧은 쪽에 맞춰 배율을 정한다', () => {
    const r = fitViewBox({
      bbox: { x: -500, y: -100, w: 1000, h: 500 },
      frame: { w: 1000, h: 1000 },
      free: { x0: 0, y0: 0, x1: 1000, y1: 1000 },
    })
    expect(r.scale).toBe(1)
    expect(r.viewBox).toBe('-500.0 -350.0 1000.0 1000.0')
  })

  it('빈 자리가 왼쪽에 치우치면 장면도 왼쪽으로 간다', () => {
    const r = fitViewBox({
      bbox: { x: 0, y: 0, w: 100, h: 100 },
      frame: { w: 400, h: 200 },
      free: { x0: 0, y0: 0, x1: 200, y1: 200 },
      maxScale: 4,
    })
    // 빈 자리 가운데(100,100)에 bbox 가운데(50,50)가 오도록
    expect(r.scale).toBe(2)
    expect(r.viewBox).toBe('0.0 0.0 200.0 100.0')
  })

  it('최대 배율을 넘지 않는다', () => {
    const r = fitViewBox({
      bbox: { x: 0, y: 0, w: 10, h: 10 },
      frame: { w: 1000, h: 1000 },
      free: { x0: 0, y0: 0, x1: 1000, y1: 1000 },
      maxScale: 1.5,
    })
    expect(r.scale).toBe(1.5)
  })

  it('장면이 작을수록 핀을 키운다', () => {
    expect(pinScaleFor(1.2)).toBe(1)
    expect(pinScaleFor(0.4)).toBe(1.75)
  })
})
