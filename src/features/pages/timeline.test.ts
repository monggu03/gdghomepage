import { describe, expect, it } from 'vitest'
import { layoutSpans, stepStates } from './timeline'

describe('stepStates', () => {
  const dates = ['2026-09-22', '2026-10-06', '2026-10-13', '2026-10-27', null, '2026-12-29']

  it('지난 단계는 done, 바로 다음 하나만 next', () => {
    expect(stepStates(dates, '2026-10-17')).toEqual(['done', 'done', 'done', 'next', 'later', 'later'])
  })

  it('그날이 되면 done', () => {
    expect(stepStates(dates, '2026-10-27')).toEqual(['done', 'done', 'done', 'done', 'next', 'later'])
  })

  it('모두 지나면 next 가 없다', () => {
    expect(stepStates(['2026-01-01', '2026-02-01'], '2026-10-17')).toEqual(['done', 'done'])
  })
})

describe('layoutSpans', () => {
  it('날 수에 비례해 놓고 달이 바뀌는 곳에 눈금을 둔다', () => {
    const { boxes, months, days, lanes } = layoutSpans([
      { id: 'core', start: '2026-08-18', end: '2026-08-31' },
      { id: 'general', start: '2026-09-03', end: '2026-09-10' },
      { id: 'ot', start: '2026-09-15' },
    ])
    expect(days).toBe(29)
    expect(boxes[0]).toEqual({ id: 'core', left: 0, width: 48.28, lane: 0 })
    expect(lanes).toBe(1)
    expect(boxes[2].left + boxes[2].width).toBeCloseTo(100, 1)
    expect(months).toEqual([{ label: '9월', left: 48.28 }])
  })

  it('날짜가 겹치는 기간만 위 줄로 올린다', () => {
    const { boxes, lanes } = layoutSpans([
      { id: 'core', start: '2026-08-18', end: '2026-08-31' },
      { id: 'marketing', start: '2026-09-02', end: '2026-09-09' },
      { id: 'general', start: '2026-09-03', end: '2026-09-10' },
      { id: 'ot', start: '2026-09-15' },
    ])
    expect(boxes.map((b) => `${b.id}:${b.lane}`)).toEqual(['core:0', 'marketing:0', 'general:1', 'ot:0'])
    expect(lanes).toBe(2)
  })

  it('끝난 다음 날 시작하면 같은 줄', () => {
    const { boxes } = layoutSpans([
      { id: 'a', start: '2026-09-01', end: '2026-09-02' },
      { id: 'b', start: '2026-09-03' },
    ])
    expect(boxes.map((b) => b.lane)).toEqual([0, 0])
  })

  it('빈 목록', () => {
    expect(layoutSpans([])).toEqual({ boxes: [], months: [], days: 0, lanes: 0 })
  })
})
