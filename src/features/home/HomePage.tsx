import { CalendarSection } from './CalendarSection'
import { HeroSection } from './HeroSection'
import { IntroSection } from './IntroSection'
import { JoinBand } from './JoinBand'
import { ReviewsSection } from './ReviewsSection'
import { StrengthsSection } from './StrengthsSection'
import s from './home.module.css'

/** 홈 = 지도 첫 화면 + 배범서 기획의 홈 구성 (소개 · 역량 · 멤버 후기 · 캘린더) */
export function HomePage() {
  return (
    <>
      <HeroSection />
      <div className={s.below}>
        <IntroSection />
        <StrengthsSection />
        <ReviewsSection />
        <CalendarSection />
        <JoinBand />
      </div>
    </>
  )
}
