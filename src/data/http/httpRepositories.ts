import type { Repositories } from '@/data/repositories'
import type { PreviewItem, Review, ScheduleEvent, SearchHit, Stat } from '@/domain/types'

/**
 * Spring Boot API 를 쓰는 구현 (자리만 잡아 둔 것).
 * 아래 주소는 제안일 뿐이고, 실제 주소와 응답 모양은 BE 팀의 API 명세서(11/2)를 따른다.
 * 응답 모양이 domain/types 와 다르면 여기서 바꿔서(adapter) 넘긴다. 컴포넌트는 고치지 않는다.
 *
 * Gemini API 키는 브라우저에 두지 않는다. 검색은 반드시 서버(/api/search)를 거친다.
 */
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return (await res.json()) as T
}

export function createHttpRepositories(baseUrl = '/api'): Repositories {
  return {
    schedule: { list: () => getJson<ScheduleEvent[]>(`${baseUrl}/schedules`) },
    stats: { list: () => getJson<Stat[]>(`${baseUrl}/stats`) },
    previews: {
      latest: (place, limit) => getJson<PreviewItem[]>(`${baseUrl}/places/${place}/latest?limit=${limit}`),
    },
    reviews: { list: () => getJson<Review[]>(`${baseUrl}/reviews`) },
    search: {
      name: 'Gemini',
      search: (q) => getJson<SearchHit[]>(`${baseUrl}/search?q=${encodeURIComponent(q)}`),
    },
  }
}
