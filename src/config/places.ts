import type { Place, PlaceId } from '@/domain/types'

/**
 * 지도 = 메뉴.
 * 장소를 하나 더 만들려면 여기 한 줄을 추가하면 된다. 건물 모양(roof)은 등록된 것 중에서 고른다.
 * 격자는 14×14, 가운데 6.2~7.8 줄이 십자 보행로, 5~9 칸이 광장이다.
 */
export const PLACES: readonly Place[] = [
  {
    id: 'about',
    label: 'GDGoC DGU',
    sub: '소개',
    path: '/',
    color: '#212121',
    description: 'Google Developer Groups on Campus Dongguk University. 듣는 활동보다 직접 만드는 활동을 보여줍니다.',
  },
  {
    id: 'community',
    label: 'Community',
    sub: '공지 · 세션 · 행사',
    path: '/community',
    color: '#4285f4',
    description: '공지와 세션 자료, 행사 소식을 한곳에 모읍니다.',
    footprint: { x: 0.9, y: 0.9, w: 3.4, d: 3.0, h: 1.5, door: 'R', roof: 'screen', pinGap: 0.75 },
  },
  {
    id: 'projects',
    label: 'Projects',
    sub: '프로젝트 포트폴리오',
    path: '/projects',
    color: '#ea4335',
    live: true,
    description: '실제 배포까지 가는 팀 프로젝트. 12.29 Demo Day에서 성과를 공유합니다.',
    footprint: { x: 9.7, y: 0.9, w: 3.4, d: 3.2, h: 1.25, door: 'L', roof: 'saw', pinGap: 1.05 },
  },
  {
    id: 'teams',
    label: 'Teams',
    sub: '팀원 모집 게시판',
    path: '/teams',
    color: '#fbbc04',
    description: '스터디 · 프로젝트 · 공모전을 같이할 팀원을 모읍니다.',
    footprint: { x: 0.9, y: 9.7, w: 3.4, d: 3.4, h: 0.95, door: 'R', roof: 'arch', pinGap: 0.7 },
  },
  {
    id: 'recruits',
    label: 'Recruits',
    sub: '지원하기',
    path: '/recruits',
    color: '#34a853',
    description: '모집 일정과 지원 방법을 안내합니다.',
    footprint: { x: 9.8, y: 9.8, w: 2.7, d: 2.7, h: 1.05, door: 'L', roof: 'gable', pinGap: 0.7 },
  },
]

export const PLACE_BY_ID: Readonly<Record<PlaceId, Place>> = Object.fromEntries(
  PLACES.map((p) => [p.id, p]),
) as Record<PlaceId, Place>

/** 상단 메뉴 순서 (배범서 기획 순서) */
export const NAV_ORDER: readonly PlaceId[] = ['about', 'projects', 'teams', 'community', 'recruits']

/** 메뉴에 보이는 이름: 소개 장소는 메뉴에서 Home */
export const navLabel = (id: PlaceId) => (id === 'about' ? 'Home' : PLACE_BY_ID[id].label)

/** 처음 열려 있을 장소: 지금 진행 중인 곳 */
export const DEFAULT_PLACE: PlaceId = PLACES.find((p) => p.live)?.id ?? 'about'
