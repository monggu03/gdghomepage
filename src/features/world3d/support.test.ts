import { describe, expect, it } from 'vitest'
import { deviceAllows3D } from './support'

const nav = (o: object) => o as Navigator

describe('3D 지도를 쓸 기기', () => {
  it('데스크톱(마우스)은 기기 조건 없이', () => expect(deviceAllows3D(nav({ hardwareConcurrency: 2, deviceMemory: 2 }), false)).toBe(true))
  it('데이터 절약 모드는 늘 SVG', () => expect(deviceAllows3D(nav({ connection: { saveData: true } }), false)).toBe(false))
  it('폰: 메모리 4GB · 코어 4개 이상만', () => {
    expect(deviceAllows3D(nav({ hardwareConcurrency: 8, deviceMemory: 4 }), true)).toBe(true)
    expect(deviceAllows3D(nav({ hardwareConcurrency: 8, deviceMemory: 2 }), true)).toBe(false)
    expect(deviceAllows3D(nav({ hardwareConcurrency: 2, deviceMemory: 8 }), true)).toBe(false)
  })
  it('알려 주지 않는 값(iOS Safari 의 메모리)은 막지 않는다', () => expect(deviceAllows3D(nav({ hardwareConcurrency: 6 }), true)).toBe(true))
})
