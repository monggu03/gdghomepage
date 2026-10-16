import type { PlaceId } from '@/domain/types'

/**
 * 아직 만들지 않은 페이지의 계획. 배범서 '기획 구체화'(노션)와 Figma 와이어프레임 화면 번호를 따른다.
 * 페이지를 실제로 만들면 여기서 지우고 pages/ 에 컴포넌트를 만든다.
 */
export interface PagePlan {
  /** 지도 장소와 같은 페이지면 그 id (미리보기 데이터를 같이 보여준다) */
  place?: PlaceId
  title: string
  sub: string
  wireframe: string
  features: string[]
  /** 팀에서 정해야 하는 것 */
  open?: string[]
}

export const PAGE_PLANS = {
  projects: {
    place: 'projects',
    title: 'Projects',
    sub: '프로젝트 포트폴리오',
    wireframe: '02',
    features: ['검색', '카드 3열 · 2열 · 1열 (썸네일 · 제목 · 짧은 설명)', '아래쪽 페이지 나누기'],
    open: ['관리자만 올릴지, 회원도 올릴지'],
  },
  teams: {
    place: 'teams',
    title: 'Teams',
    sub: '스터디 · 프로젝트 · 공모전 팀원 모집 게시판',
    wireframe: '03 · 03-1 · 03-2',
    features: ['검색', '한 페이지에 10개', '글 작성: 제목 · 기간 · 내용 (작성할 때 회원 인증)', '글 조회 + 댓글'],
    open: ['회원 인증 방식 (관리자가 준 고유 ID)'],
  },
  community: {
    place: 'community',
    title: 'Community',
    sub: '공지 · 세션 · 행사 · 정보 공유',
    wireframe: '04 · 04-1 · 04-2',
    features: ['분류: 공지 · 세션 · 행사 · 정보 공유 · 기타', '검색', '한 페이지에 10개', '글 작성 · 조회 · 댓글'],
    open: ['세션 자료 아카이브를 여기 \'세션\' 분류로 둘지'],
  },
  recruits: {
    place: 'recruits',
    title: 'Recruits',
    sub: '지원하기',
    wireframe: '05 · 05-1 · 05-2',
    features: ['모집 일정 이미지', '지원하기 (지원 기간이 아니면 안내 팝업)', '지원서 작성'],
    open: ['지원서를 직접 받을지, 구글 폼으로 연결할지'],
  },
  admin: {
    title: '관리자',
    sub: '운영진 전용',
    wireframe: '06 · 07 · 07-1~07-4',
    features: ['관리자 로그인 (구글 로그인)', '대시보드: 접속자 수 · 새 글 · 새 댓글 · 행사 일정', 'Teams · Community 게시판 관리', '사용자 관리 (추가, 고유 ID)', '지원폼 작성 (선택)'],
  },
} satisfies Record<string, PagePlan>

export type PagePlanId = keyof typeof PAGE_PLANS
