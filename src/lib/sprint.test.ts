import { describe, expect, it } from 'vitest'
import { sprintProgress } from './sprint'

const dates = ['2026-09-22', '2026-10-06', '2026-10-13', '2026-10-27']

describe('sprintProgress', () => {
  it('시작 전', () => {
    expect(sprintProgress(dates, '2026-09-01')).toEqual({ current: 0, ratio: 0 })
  })

  it('첫 단계 당일은 첫 단계가 지금', () => {
    expect(sprintProgress(dates, '2026-09-22')).toEqual({ current: 0, ratio: 1 })
  })

  it('주제 발표(10/13)와 중간 발표(10/27) 사이 10/20 은 절반', () => {
    expect(sprintProgress(dates, '2026-10-20')).toEqual({ current: 3, ratio: 0.5 })
  })

  it('중간 발표 당일은 중간 발표가 지금 (아직 완료가 아님)', () => {
    expect(sprintProgress(dates, '2026-10-27')).toEqual({ current: 3, ratio: 1 })
  })

  it('모두 끝나면 마지막 다음', () => {
    expect(sprintProgress(dates, '2026-12-31')).toEqual({ current: 4, ratio: 1 })
  })
})
