import { useState } from 'react'
import { useReviews } from '@/data/queries'
import type { Review } from '@/domain/types'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import s from './home.module.css'

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className={s.review}>
      <span className={s.quote} aria-hidden="true">
        “
      </span>
      <blockquote>{review.body}</blockquote>
      <figcaption>
        {review.author}
        {review.part && ` · ${review.part}`}
      </figcaption>
    </figure>
  )
}

/** 후기가 아직 없을 때: 빈 카드 여러 장 대신 안내 한 장 */
function ReviewsEmpty({ message }: { message: string }) {
  return (
    <div className={s.reviewsEmpty}>
      <span className={s.quote} aria-hidden="true">
        “
      </span>
      <p>{message}</p>
    </div>
  )
}

/**
 * 멤버 후기 (배범서 기획 2안: 카드가 옆으로 계속 흐름).
 * 같은 줄을 두 번 이어 붙여 끊김 없이 돌린다. 멈춤 버튼이 있고, 마우스를 올려도 멈춘다.
 * '동작 줄이기' 설정이면 흐르지 않고 옆으로 넘겨 본다 (복제본도 만들지 않는다).
 */
export function ReviewsSection() {
  const { data, isPending, isError } = useReviews()
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const reviews = data ?? []
  const flowing = !reduce && reviews.length > 2

  let body
  if (isError) body = <ReviewsEmpty message="후기를 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요." />
  else if (isPending) body = <ReviewsEmpty message="불러오는 중…" />
  else if (reviews.length === 0) body = <ReviewsEmpty message="첫 후기를 받고 있습니다. 4기 활동이 끝나면 멤버가 직접 쓴 후기를 이곳에 싣습니다." />
  else
    body = (
      <div className={`${s.marquee} ${flowing ? '' : s.marqueeStatic}`} data-paused={paused || undefined}>
        <ul className={s.marqueeTrack}>
          {(flowing ? [...reviews, ...reviews] : reviews).map((r, i) => (
            <li key={`${r.id}-${i}`} className={s.marqueeItem} aria-hidden={i >= reviews.length || undefined}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
      </div>
    )

  return (
    <section className={s.section} aria-labelledby="reviews-title">
      <div className={s.sectionHead}>
        <h2 id="reviews-title">멤버 후기</h2>
        <span className={s.note}>멤버가 직접 쓴 글만 싣습니다</span>
        {flowing && (
          <button type="button" className={s.pause} aria-pressed={paused} onClick={() => setPaused(!paused)}>
            {paused ? '▶ 다시 흐르기' : '❚❚ 멈춤'}
          </button>
        )}
      </div>
      {body}
    </section>
  )
}
