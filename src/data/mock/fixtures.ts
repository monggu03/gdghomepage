import type { ArchiveDoc, PlaceId, PreviewItem, Review, ScheduleEvent, Stat } from '@/domain/types'

/**
 * 예시 데이터. 일정과 행사 이름은 4기 실제 일정이고,
 * sample: true 가 붙은 것은 아직 실제 값이 없어 넣은 예시다. 화면에도 '예시'로 표시된다.
 */

export const SCHEDULE: ScheduleEvent[] = [
  { date: '2026-10-20', title: '중간고사 휴회', kind: 'rest', place: 'community' },
  { date: '2026-10-27', title: 'G-Sprint 중간 발표', kind: 'sprint', place: 'projects' },
  { date: '2026-11-02', title: '동홍동락 1차 @홍익대', kind: 'event', place: 'community' },
  { date: '2026-12-01', title: '금융권 IT 현업자 세미나', kind: 'session', place: 'community' },
  { date: '2026-12-08', title: '기말고사 휴회', kind: 'rest', place: 'community' },
  { date: '2026-12-22', title: '동홍동락 2차 @동국대', kind: 'event', place: 'community' },
  { date: '2026-12-29', title: 'Demo Day · 성과공유회', kind: 'sprint', place: 'projects' },
  { date: '2027-01-30', endDate: '2027-01-31', title: '동지톤 @동국대', kind: 'event', place: 'teams' },
]

export const STATS: Stat[] = [
  { id: 'members', label: '누적 멤버', value: 128, note: '1st–4th', sample: true, color: '#4285f4' },
  { id: 'projects', label: '프로젝트', value: 34, note: 'G-Sprint 포함', sample: true, color: '#ea4335' },
  { id: 'sessions', label: '세션 자료', value: 52, note: 'Community 세션', sample: true, color: '#fbbc04' },
]

export const PREVIEWS: Record<PlaceId, PreviewItem[]> = {
  about: [
    { when: '핵심 가치', title: 'Connect · Learn · Grow' },
    { when: '파트', title: 'Frontend · Backend · AI/ML · Design' },
    { when: '4th', title: 'G-Sprint → 동지톤 → G-Upto' },
  ],
  projects: [
    { when: '2026-10-13', title: '팀별 주제 발표', tag: 'G-Sprint' },
    { when: '2026-10-27', title: '중간 발표', tag: 'G-Sprint' },
    { when: '2026-12-29', title: 'Demo Day · 성과공유회', tag: 'G-Sprint' },
  ],
  teams: [
    { when: '2027-01-30', title: '동지톤 같이 나갈 팀원', tag: '공모전', sample: true },
    { when: '모집 중', title: 'Spring Boot 스터디', tag: '스터디', sample: true },
    { when: '모집 중', title: 'Gemini API 사이드 프로젝트', tag: '프로젝트', sample: true },
  ],
  community: [
    { when: '2026-10-06', title: 'Core Session #2', tag: '세션' },
    { when: '2026-10-20', title: '중간고사 휴회', tag: '공지' },
    { when: '2026-11-02', title: '동홍동락 1차 @홍익대', tag: '행사' },
  ],
  recruits: [
    { when: '공지 예정', title: '5th 모집 일정', tag: '모집' },
    { when: '안내', title: '지원 자격과 활동 시간', tag: '안내' },
    { when: 'FAQ', title: '자주 묻는 질문', tag: 'FAQ' },
  ],
}

export const REVIEWS: Review[] = [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }, { id: 'r4' }, { id: 'r5' }]

export const ARCHIVE: ArchiveDoc[] = [
  { place: 'community', title: 'Core Session #2', meta: '2026.10.06 · 세션', keywords: 'core session 세션 코어 세미나' },
  { place: 'community', title: 'Core Session #1', meta: '2026.09.22 · 세션', keywords: 'core session 세션 코어 세미나' },
  { place: 'community', title: 'Welcome Session', meta: '2026.09.15 · 세션', keywords: 'welcome session 세션 웰컴 오리엔테이션' },
  { place: 'community', title: '금융권 IT 현업자 세미나', meta: '2026.12.01 · 세션', keywords: '세미나 금융 현업 it 백엔드 backend' },
  { place: 'community', title: 'Spring Boot 입문 세션', meta: '3rd · 세션', keywords: 'spring boot 스프링 백엔드 backend 세미나 자료', sample: true },
  { place: 'community', title: 'React 상태 관리 세션', meta: '3rd · 세션', keywords: 'react 리액트 프론트 frontend 세미나 자료', sample: true },
  { place: 'community', title: '동홍동락 1차', meta: '2026.11.02 · 행사 · @홍익대', keywords: '동홍동락 교류전 홍익 hiu dgu 연합 행사 ci/cd' },
  { place: 'community', title: '동홍동락 2차', meta: '2026.12.22 · 행사 · @동국대', keywords: '동홍동락 교류전 홍익 hiu dgu 연합 행사' },
  { place: 'projects', title: 'GDGoC DGU 홈페이지 리뉴얼', meta: '4th G-Sprint', keywords: 'react spring boot gemini api firebase 홈페이지 프로젝트 g-sprint' },
  { place: 'projects', title: 'Demo Day · 성과공유회', meta: '2026.12.29', keywords: 'demo day 데모데이 성과공유회 발표 g-sprint 프로젝트' },
  { place: 'projects', title: 'Solution Challenge 프로젝트', meta: '3rd', keywords: 'solution challenge 솔루션 챌린지 프로젝트 ai gemini', sample: true },
  { place: 'projects', title: 'G-Upto', meta: '2027.03–04', keywords: 'g-upto 실사용자 프로젝트' },
  { place: 'teams', title: '동지톤 팀원 모집', meta: '2027.01.30–31 · 공모전', keywords: '동지톤 해커톤 hackathon 팀원 모집 공모전', sample: true },
  { place: 'teams', title: 'Spring Boot 스터디', meta: '스터디', keywords: 'spring boot 스프링 백엔드 스터디 팀원', sample: true },
  { place: 'recruits', title: '5th 모집 일정', meta: '공지 예정', keywords: '모집 지원 지원하기 리크루팅 5기 5th 일정' },
  { place: 'recruits', title: '자주 묻는 질문', meta: 'FAQ', keywords: 'faq 질문 지원 모집 면접' },
  { place: 'about', title: 'GDGoC DGU 소개', meta: 'Connect · Learn · Grow', keywords: '소개 gdgoc gdg dgu 동아리 커뮤니티 about' },
  { place: 'about', title: '파트 4개', meta: 'Frontend · Backend · AI/ML · Design', keywords: '파트 frontend backend ai/ml design 프론트 백엔드 디자인 기획' },
]
