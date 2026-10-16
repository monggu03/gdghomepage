import type { ArchiveDoc, PlaceId, PreviewItem, Review, ScheduleEvent, Stat } from '@/domain/types'

/**
 * 서버 없이 화면을 볼 때 쓰는 데이터.
 * 일정과 행사 이름은 4기 실제 일정이다 (인스타그램 · 연간 계획 기준).
 * sample: true 는 게시판 모양을 보여주려고 넣은 예시 글이고, 화면에 '예시'로 표시된다.
 * 지나간 기수의 활동처럼 읽힐 수 있는 예시는 넣지 않는다 (사실로 오해될 수 있음).
 */

export const SCHEDULE: ScheduleEvent[] = [
  { id: 'welcome', date: '2026-09-15', title: 'Welcome Session', kind: 'session', place: 'community' },
  { id: 'core-1', date: '2026-09-22', title: 'Core Session #1', kind: 'session', place: 'community' },
  { id: 'core-2', date: '2026-10-06', title: 'Core Session #2', kind: 'session', place: 'community' },
  { id: 'sprint-kickoff', date: '2026-10-13', title: 'G-Sprint 주제 발표', kind: 'sprint', place: 'projects' },
  { id: 'rest-mid', date: '2026-10-20', title: '중간고사 휴회', kind: 'rest', place: 'community' },
  { id: 'sprint-mid', date: '2026-10-27', title: 'G-Sprint 중간 발표', kind: 'sprint', place: 'projects' },
  { id: 'dhdr-1', date: '2026-11-02', title: '동홍동락 1차 @홍익대', kind: 'event', place: 'community' },
  { id: 'seminar-fin', date: '2026-12-01', title: '금융권 IT 현업자 세미나', kind: 'session', place: 'community' },
  { id: 'rest-final', date: '2026-12-08', title: '기말고사 휴회', kind: 'rest', place: 'community' },
  { id: 'mt', date: '2026-12-15', title: 'MT', kind: 'event', place: 'community' },
  { id: 'dhdr-2', date: '2026-12-22', title: '동홍동락 2차 @동국대', kind: 'event', place: 'community' },
  { id: 'demo-day', date: '2026-12-29', title: '데모데이 · 성과공유회', kind: 'sprint', place: 'projects' },
  { id: 'dongjithon', date: '2027-01-30', endDate: '2027-01-31', title: '동지톤 @동국대', kind: 'event', place: 'teams' },
]

/** 실제 숫자(멤버 수 등)가 정해지면 넣는다. 비어 있으면 첫 화면에 숫자 줄이 나오지 않는다 */
export const STATS: Stat[] = []

export const PREVIEWS: Record<Exclude<PlaceId, 'about'>, PreviewItem[]> = {
  projects: [
    { id: 'p-kickoff', date: '2026-10-13', title: '팀별 주제 발표', tag: 'G-Sprint' },
    { id: 'p-mid', date: '2026-10-27', title: '중간 발표', tag: 'G-Sprint' },
    { id: 'p-demo', date: '2026-12-29', title: '데모데이 · 성과공유회', tag: 'G-Sprint' },
  ],
  teams: [
    { id: 't-dongjithon', date: '2027-01-30', title: '동지톤 같이 나갈 팀원', tag: '공모전', sample: true },
    { id: 't-spring', label: '모집 중', title: 'Spring Boot 스터디', tag: '스터디', sample: true },
    { id: 't-gemini', label: '모집 중', title: 'Gemini API 사이드 프로젝트', tag: '프로젝트', sample: true },
  ],
  community: [
    { id: 'c-core-2', date: '2026-10-06', title: 'Core Session #2', tag: '세션' },
    { id: 'c-rest', date: '2026-10-20', title: '중간고사 휴회', tag: '공지' },
    { id: 'c-dhdr-1', date: '2026-11-02', title: '동홍동락 1차 @홍익대', tag: '행사' },
  ],
  recruits: [
    { id: 'r-5th', label: '공지 예정', title: '5기 모집 일정', tag: '모집' },
    { id: 'r-4th', label: '4기', title: '8월 코어 멤버 · 9월 일반 멤버 모집', tag: '지난 모집' },
  ],
}

/** 멤버가 직접 쓴 후기만 싣는다. 받기 전에는 비워 둔다 */
export const REVIEWS: Review[] = []

export const ARCHIVE: ArchiveDoc[] = [
  { id: 'a-core-2', place: 'community', title: 'Core Session #2', meta: '2026.10.06 · 세션', keywords: 'core session 세션 코어 세미나' },
  { id: 'a-core-1', place: 'community', title: 'Core Session #1', meta: '2026.09.22 · 세션', keywords: 'core session 세션 코어 세미나' },
  { id: 'a-welcome', place: 'community', title: 'Welcome Session', meta: '2026.09.15 · 세션', keywords: 'welcome session 세션 웰컴 오리엔테이션' },
  { id: 'a-seminar', place: 'community', title: '금융권 IT 현업자 세미나', meta: '2026.12.01 · 세션', keywords: '세미나 금융 현업 it 백엔드 backend' },
  { id: 'a-dhdr-1', place: 'community', title: '동홍동락 1차', meta: '2026.11.02 · 동국대 × 홍익대 교류전 · @홍익대', keywords: '동홍동락 교류전 홍익 홍익대 연합 행사 ci/cd' },
  { id: 'a-dhdr-2', place: 'community', title: '동홍동락 2차', meta: '2026.12.22 · 동국대 × 홍익대 교류전 · @동국대', keywords: '동홍동락 교류전 홍익 홍익대 연합 행사' },
  { id: 'a-mt', place: 'community', title: 'MT', meta: '2026.12.15 · 행사', keywords: 'mt 엠티 행사' },
  { id: 'a-homepage', place: 'projects', title: 'GDGoC DGU 홈페이지 리뉴얼', meta: '4기 G-Sprint', keywords: 'react spring boot gemini api firebase 홈페이지 프로젝트 g-sprint' },
  { id: 'a-demo', place: 'projects', title: '데모데이 · 성과공유회', meta: '2026.12.29 · G-Sprint', keywords: 'demo day 데모데이 성과공유회 발표 g-sprint 프로젝트' },
  { id: 'a-dongjithon', place: 'teams', title: '동지톤 팀원 모집', meta: '2027.01.30–31 · 공모전', keywords: '동지톤 해커톤 hackathon 팀원 모집 공모전', sample: true },
  { id: 'a-spring', place: 'teams', title: 'Spring Boot 스터디', meta: '스터디', keywords: 'spring boot 스프링 백엔드 스터디 팀원', sample: true },
  { id: 'a-5th', place: 'recruits', title: '5기 모집 일정', meta: '공지 예정', keywords: '모집 지원 지원하기 리크루팅 5기 5th 일정' },
  { id: 'a-about', place: 'about', title: 'GDGoC DGU 소개', meta: '연결 · 배움 · 성장', keywords: '소개 gdgoc gdg dgu 동아리 커뮤니티 about connect learn grow' },
  { id: 'a-parts', place: 'about', title: '파트 4개', meta: '프론트엔드 · 백엔드 · AI/ML · 디자인', keywords: '파트 frontend backend ai/ml design 프론트 백엔드 디자인' },
]
