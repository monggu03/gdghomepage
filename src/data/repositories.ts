import type { PlaceId, PreviewItem, Review, ScheduleEvent, SearchHit, Stat } from '@/domain/types'

/**
 * 화면이 데이터를 가져오는 '창구' (Repository 패턴).
 * 컴포넌트는 이 인터페이스만 알고, 데이터가 예시(mock)인지 Spring Boot API(http)인지는 모른다.
 * 그래서 백엔드가 준비되면 컴포넌트를 고치지 않고 구현체만 갈아 끼우면 된다.
 */
export interface ScheduleRepository {
  list(): Promise<ScheduleEvent[]>
}

export interface StatsRepository {
  list(): Promise<Stat[]>
}

export interface PreviewRepository {
  /** 장소별 최신 글 몇 개 (지도 패널의 '최신 3개') */
  latest(place: PlaceId, limit: number): Promise<PreviewItem[]>
}

export interface ReviewRepository {
  list(): Promise<Review[]>
}

/** 아카이브 검색. 지금은 키워드 일치, 나중에 서버를 거쳐 Gemini API 로 바꾼다 (Strategy) */
export interface SearchService {
  readonly name: string
  search(query: string): Promise<SearchHit[]>
}

export interface Repositories {
  schedule: ScheduleRepository
  stats: StatsRepository
  previews: PreviewRepository
  reviews: ReviewRepository
  search: SearchService
}
