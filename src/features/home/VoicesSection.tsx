import { VOICES, voices } from '@/content/story'
import { StorySection } from '@/features/common'
import { isShowableVoice } from './homeData'
import s from './voices.module.css'

/**
 * 사람: 멤버가 직접 한 말 (content/story.ts 의 voices). 공개 동의가 기록된 것만 싣고, 없으면 섹션째 그리지 않는다.
 * 지금은 비어 있어서 홈에 나오지 않는다 (지어낸 후기 금지, docs/DESIGN.md 1 · 10장).
 * 나올 때는 먹색 띠와 페이지 끝(옅은 회색) 사이의 흰 이야기 섹션이 된다 (같은 면이 이어지지 않는다).
 */
export function VoicesSection() {
  const shown = voices.filter(isShowableVoice)
  if (shown.length === 0) return null
  return (
    <StorySection id="people" eyebrow={VOICES.eyebrow} placeColor={null} title={VOICES.title}>
      <ul className={s.voices}>
        {shown.map((v) => (
          <li key={v.id} className={s.voice}>
            <figure>
              <blockquote>{v.quote}</blockquote>
              <figcaption>
                {v.name} · {v.part} · <span className="num">{v.generation}</span>기
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </StorySection>
  )
}
