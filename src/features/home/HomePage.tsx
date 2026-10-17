import { NowSection } from '@/features/now/NowSection'
import { ActivitiesSection } from './ActivitiesSection'
import { HeroSection } from './HeroSection'
import { HistorySection } from './HistorySection'
import { JoinSection } from './JoinSection'
import { ProjectsSection } from './ProjectsSection'
import s from './sections.module.css'

/**
 * 홈: 첫 화면(소개 + 지도) → 지금 4기 일정 → 활동 → 기록 → 프로젝트 → 모집.
 * 내용이 없는 섹션은 스스로 숨는다 (후기는 아직 없어서 섹션이 없다).
 */
export function HomePage() {
  return (
    <>
      <HeroSection />
      <div className={`container ${s.now}`}>
        <NowSection />
      </div>
      {/* 지도 광장 깃발의 '소개 보기'가 오는 곳 */}
      <div id="about">
        <ActivitiesSection />
        <HistorySection />
      </div>
      <ProjectsSection />
      <JoinSection />
    </>
  )
}
