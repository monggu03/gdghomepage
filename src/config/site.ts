/**
 * 사이트 공통 문구와 링크. 실제 주소가 정해지면 여기만 바꾼다.
 * 확인되지 않은 정보는 넣지 않는다. 값이 null 이면 화면에서 그 줄을 숨긴다.
 */
export const SITE = {
  shortName: 'GDGoC DGU',
  fullName: 'Google Developer Groups on Campus Dongguk University',
  generation: '4기',
  generationYears: '2026–27',
  /** 첫 화면 한 줄 소개 */
  pitch: '구글 개발자 기술을 함께 배우고, 팀 프로젝트로 직접 만들어 배포하는 동국대학교 개발 커뮤니티입니다.',
  links: {
    /** 인스타그램 프로필에서 확인 (2026-10-15) */
    instagram: 'https://www.instagram.com/gdg.donggukuniv/',
    instagramHandle: '@gdg.donggukuniv',
    linktree: 'https://linktr.ee/GDGoC_DGU',
    email: null as string | null,
    linkedin: null as string | null,
    github: null as string | null,
  },
} as const

/** 소개 장소의 미리보기 (서버 데이터가 아니라 고정 문구) */
export const ABOUT_FACTS = [
  { id: 'values', label: '핵심 가치', title: '연결 · 배움 · 성장' },
  { id: 'parts', label: '파트', title: '프론트엔드 · 백엔드 · AI/ML · 디자인' },
  { id: 'season', label: `${SITE.generation} 활동`, title: 'G-Sprint · 동홍동락 · 동지톤' },
] as const

/** 지난 모집에서 확인된 사실 (인스타그램 4기 모집 게시물 기준). 5기 일정이 아니다 */
export const RECRUIT_FACTS = [
  { id: 'when', label: '지난 모집', body: '4기는 8월에 코어 멤버, 9월 초에 일반 멤버를 모집했습니다.' },
  { id: 'session', label: '정기 세션', body: '화요일에 세션을 엽니다. 시험 기간에는 쉽니다.' },
  { id: 'next', label: '5기 모집', body: '일정이 정해지면 이 페이지와 인스타그램에 가장 먼저 공지합니다.' },
] as const

/** 4기 G-Sprint 일정 (확정) */
export const SPRINT = {
  title: 'G-Sprint',
  demoDay: '2026-12-29',
  steps: [
    { label: '발제', when: '09.22', date: '2026-09-22' },
    { label: '팀빌딩', when: '10.06', date: '2026-10-06' },
    { label: '주제 발표', when: '10.13', date: '2026-10-13' },
    { label: '중간 발표', when: '10.27', date: '2026-10-27' },
    { label: '개발', when: '11월', date: '2026-11-03' },
    { label: '데모데이', when: '12.29', date: '2026-12-29', note: '성과공유회' },
  ],
} as const

/**
 * 팀 내부 기획 메모(들어갈 기능, 정할 것, 와이어프레임 번호)를 화면에 보일지.
 * 외부 방문자에게는 숨기고, 개발 중(npm run dev)이거나 VITE_SHOW_PLAN=true 일 때만 보인다.
 */
export const SHOW_PLAN = import.meta.env.DEV || import.meta.env.VITE_SHOW_PLAN === 'true'
