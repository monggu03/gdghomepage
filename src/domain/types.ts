/**
 * 화면 전체에서 쓰는 데이터 모양.
 * 백엔드(Spring Boot) API 응답도 이 모양에 맞춰 바꿔서(adapter) 넘긴다.
 */

/** 지도 위 장소 = 상단 메뉴 하나 (배범서 기획: Home · Projects · Teams · Community · Recruits) */
export type PlaceId = 'about' | 'projects' | 'teams' | 'community' | 'recruits'

/** 건물 지붕 모양. 새 모양은 features/campus/roofs 에 컴포넌트를 하나 추가하고 등록한다. */
export type RoofType = 'screen' | 'saw' | 'arch' | 'gable'

/** 건물 문이 있는 면: L = 화면 왼쪽 아래를 보는 면(+y), R = 오른쪽 아래를 보는 면(+x) */
export type Face = 'L' | 'R'

/** 지도 격자 위 건물 자리 (격자 1칸 = 화면 64×32px 마름모) */
export interface Footprint {
  x: number
  y: number
  w: number
  d: number
  /** 벽 높이 (격자 단위) */
  h: number
  door: Face
  roof: RoofType
  /** 지붕 꼭대기에서 이름표 핀까지 띄울 높이 */
  pinGap: number
}

export interface Place {
  id: PlaceId
  /** 지도 이름표와 메뉴에 같이 쓰는 이름 */
  label: string
  /** 한 줄 부제 */
  sub: string
  /** 이동할 페이지 */
  path: string
  /** 대표 색 (구글 4색 중 하나, 소개는 잉크색) */
  color: string
  /** 미리보기 패널 설명 (~습니다체) */
  description: string
  /** 지금 진행 중 표시 */
  live?: boolean
  /** 건물 자리. 없으면 광장 깃발(소개)로 그린다 */
  footprint?: Footprint
}

export type EventKind = 'sprint' | 'event' | 'session' | 'notice' | 'rest'

export interface ScheduleEvent {
  /** YYYY-MM-DD (한국 시간 기준 날짜) */
  date: string
  /** 여러 날 행사의 마지막 날 */
  endDate?: string
  title: string
  kind: EventKind
  /** 눌렀을 때 열 장소 */
  place: PlaceId
}

export interface Stat {
  id: string
  label: string
  value: number
  note: string
  /** 실제 값이 아직 없어서 넣은 예시 숫자 */
  sample: boolean
  color: string
}

export interface PreviewItem {
  /** YYYY-MM-DD 이거나 '공지 예정' 같은 짧은 말 */
  when: string
  title: string
  tag?: string
  sample?: boolean
}

export interface Review {
  id: string
  /** 비어 있으면 자리 표시 카드 */
  body?: string
  author?: string
  part?: string
}

export interface ArchiveDoc {
  place: PlaceId
  title: string
  meta: string
  keywords: string
  sample?: boolean
}

export interface SearchHit {
  doc: ArchiveDoc
  score: number
}

export interface SprintStep {
  label: string
  when: string
  date: string
  note?: string
}
