import type { EventKind } from '@/domain/types'

/** 지도 건물 · 장소 카드 · 일정이 aria-controls 로 가리키는 미리보기 패널 id */
export const PLACE_PANEL_ID = 'place-panel'

export const KIND_LABEL: Record<EventKind, string> = { sprint: 'G-Sprint', event: '행사', session: '세션', notice: '공지', rest: '휴회' }
