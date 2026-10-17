import type { Place, PlaceId } from '@/domain/types'

/**
 * 지도 = 메뉴.
 * 장소 하나가 메뉴 하나, 건물 하나, 이름표 하나, 미리보기 패널 하나가 된다.
 * 장소를 더하려면: domain/types.ts 의 PlaceId 에 이름 추가 → 여기 한 줄 → config/pages.ts 에 페이지 계획.
 * 격자는 14×14, 가운데 6.2~7.8 줄이 십자 보행로, 5~9 칸이 광장이다.
 */
export const PLACES: readonly Place[] = [
  {
    id: 'about',
    label: 'GDGoC DGU',
    sub: '소개',
    path: '/',
    color: '#212121',
    description: '동국대학교 학생이 운영하는 Google Developer Groups on Campus 챕터입니다. 4기는 화요일 세션과 팀 프로젝트 G-Sprint로 움직입니다.',
  },
  {
    id: 'community',
    label: '커뮤니티',
    sub: '공지 · 세션 · 행사',
    path: '/community',
    color: '#4285f4',
    description: '공지와 세션 자료, 행사 소식을 한곳에 모읍니다.',
    footprint: { x: 0.9, y: 0.9, w: 3.4, d: 3.0, h: 1.5, door: 'R', roof: 'screen', pinGap: 0.75 },
  },
  {
    id: 'projects',
    label: '프로젝트',
    sub: '팀 프로젝트 모음',
    path: '/projects',
    color: '#ea4335',
    live: true,
    description: '4기 G-Sprint 팀 프로젝트와 지난 기수 프로젝트를 모읍니다. 4기 결과는 12.29 데모데이에서 공개합니다.',
    footprint: { x: 9.7, y: 0.9, w: 3.4, d: 3.2, h: 1.25, door: 'L', roof: 'saw', pinGap: 1.05 },
  },
  {
    id: 'teams',
    label: '팀원 모집',
    sub: '스터디 · 프로젝트 · 공모전',
    path: '/teams',
    color: '#fbbc04',
    description: '스터디 · 프로젝트 · 공모전을 같이할 팀원을 모읍니다.',
    footprint: { x: 0.9, y: 9.7, w: 3.4, d: 3.4, h: 0.95, door: 'R', roof: 'arch', pinGap: 0.7 },
  },
  {
    id: 'recruits',
    label: '지원 안내',
    sub: '5기 모집',
    path: '/recruits',
    color: '#34a853',
    description: '모집 일정과 지원 방법, 지난 모집 과정을 안내합니다.',
    footprint: { x: 9.8, y: 9.8, w: 2.7, d: 2.7, h: 1.05, door: 'L', roof: 'gable', pinGap: 0.7 },
  },
]

export const PLACE_BY_ID: Readonly<Record<PlaceId, Place>> = Object.fromEntries(
  PLACES.map((p) => [p.id, p]),
) as Record<PlaceId, Place>

/** 상단 메뉴 순서 (배범서 기획 순서: Home · Projects · Teams · Community · Recruits) */
export const NAV_ORDER: readonly PlaceId[] = ['about', 'projects', 'teams', 'community', 'recruits']

/** 메뉴에 보이는 이름: 소개 장소는 메뉴에서 '홈' */
export const navLabel = (id: PlaceId) => (id === 'about' ? '홈' : PLACE_BY_ID[id].label)

/** 화면에 칠할 색. 소개 장소의 잉크색은 토큰을 따른다 */
export const placeColor = (id: PlaceId) => (id === 'about' ? 'var(--ink)' : PLACE_BY_ID[id].color)

/**
 * 처음 열려 있을 장소: 소개.
 * 처음 온 사람이 '무슨 동아리인지'부터 보게 한다 (리뷰: 신입생 · 외부 협업 관점)
 */
export const DEFAULT_PLACE: PlaceId = 'about'
