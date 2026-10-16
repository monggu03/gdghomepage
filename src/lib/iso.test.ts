import { describe, expect, it } from 'vitest'
import { iso, points, shade } from './iso'

describe('iso', () => {
  it('격자 좌표를 화면 좌표로 바꾼다', () => {
    expect(iso(0, 0)).toEqual([0, 0])
    expect(iso(1, 0)).toEqual([32, 16])
    expect(iso(0, 1)).toEqual([-32, 16])
    expect(iso(0, 0, 1)).toEqual([0, -32])
  })

  it('polygon points 문자열', () => {
    expect(points([[0, 0], [1, 0, 0]])).toBe('0.0,0.0 32.0,16.0')
  })

  it('색을 밝게, 어둡게', () => {
    expect(shade('#808080', 0)).toBe('#808080')
    expect(shade('#000000', 0.5)).toBe('#808080')
    expect(shade('#ffffff', -0.5)).toBe('#808080')
  })
})
