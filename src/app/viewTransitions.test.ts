import { describe, expect, it } from 'vitest'
import { placeOfPath, transitionKind } from './viewTransitions'

describe('페이지 전환 종류', () => {
  it('주소 이름이 같으면(?p= 로 창만 여닫기) 전환하지 않는다', () => {
    expect(transitionKind('/projects', '/projects')).toBeNull()
  })
  it('홈 → 장소 페이지는 건물로 들어가기, 장소 → 홈은 물러나기', () => {
    expect(transitionKind('/', '/projects')).toEqual({ kind: 'enter', place: 'projects' })
    expect(transitionKind('/community/', '/')).toEqual({ kind: 'leave', place: 'community' })
  })
  it('장소끼리 · 장소가 아닌 주소는 그냥 바꾸기', () => {
    expect(transitionKind('/projects', '/community')).toEqual({ kind: 'plain', place: null })
    expect(transitionKind('/', '/admin')).toEqual({ kind: 'plain', place: null })
  })
  it('하위 주소도 그 장소로 본다', () => {
    expect(placeOfPath('/recruits/faq')).toBe('recruits')
    expect(placeOfPath('/')).toBeNull()
    expect(placeOfPath('/projectsx')).toBeNull()
  })
})
