import { describe, expect, it } from 'vitest'
import type { ArchiveDoc } from '@/domain/types'
import { createKeywordSearch, rankDocs, tokenize } from './keywordSearch'

const docs: ArchiveDoc[] = [
  { place: 'community', title: 'Spring Boot 입문 세션', meta: '3rd', keywords: 'spring 백엔드 세미나' },
  { place: 'community', title: 'Core Session #2', meta: '2026.10.06', keywords: '세션 세미나' },
  { place: 'teams', title: '동지톤 팀원 모집', meta: '공모전', keywords: '해커톤' },
]

describe('keywordSearch', () => {
  it('뜻 없는 말은 빼고 소문자로 나눈다', () => {
    expect(tokenize('작년 Spring 세미나 자료')).toEqual(['spring', '세미나'])
  })

  it('제목에 맞는 글을 먼저 보여준다', () => {
    const hits = rankDocs(docs, 'Spring 세미나')
    expect(hits.map((h) => h.doc.title)).toEqual(['Spring Boot 입문 세션', 'Core Session #2'])
    expect(hits[0].score).toBe(3)
  })

  it('맞는 게 없거나 검색어가 비면 빈 목록', () => {
    expect(rankDocs(docs, '')).toEqual([])
    expect(rankDocs(docs, '블록체인')).toEqual([])
  })

  it('SearchService 모양으로 감싼다', async () => {
    const svc = createKeywordSearch(docs)
    expect((await svc.search('해커톤'))[0].doc.place).toBe('teams')
  })
})
