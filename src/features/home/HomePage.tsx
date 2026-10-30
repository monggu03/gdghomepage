import { JoinStrip } from '@/features/common'
import { useHomeStory } from '@/features/motion'
import { HeroSection } from './HeroSection'
import { HowSection } from './HowSection'
import { ProjectsSection } from './ProjectsSection'
import { VoicesSection } from './VoicesSection'

/**
 * 홈 (시안 E '지도는 표지, 나머지는 전시장'): 면이 흰 → 흰 → 먹색 → 옅은 회색 → 먹색 꼬리말로 바뀌며 이어진다.
 * 1 첫 화면: 3D 지도(사이트맵)가 배경, 오른쪽 글자 판에 이름 · 짧은 소개 · 주 버튼 · 두 번째 버튼 · 5기 모집 상태 (폰은 글자 → 지도)
 * 2 프로젝트: '팀으로 만들어 공개한 서비스 {n}개' — 실제 화면 큰 타일 2장 + 나머지 완성 프로젝트 전부 목록 (흰 이야기 섹션)
 * 3 어떻게 하나요: 주장 → 큰 숫자 세 칸 → 다음 모임 표 (먹색 이야기 섹션)
 * 4 사람: 멤버가 한 말 (동의를 받은 말이 생길 때까지 숨김)
 * 5 페이지 끝 '{gen}기에서 만나요' (common/JoinStrip, 옅은 회색) → 먹색 꼬리말
 * 모집 절차 · 파트 · 한 해 흐름 · 기록은 /recruits · /community 가 맡는다. 내용이 없는 섹션은 스스로 숨는다.
 */
export function HomePage() {
  // 스크롤 이야기 (캠퍼스로 걸어 들어가기). '동작 줄이기'면 켜지 않는다
  useHomeStory()
  return (
    <>
      <HeroSection />
      <ProjectsSection />
      <HowSection />
      <VoicesSection />
      <JoinStrip />
    </>
  )
}
