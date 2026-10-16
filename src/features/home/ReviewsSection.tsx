import { useRepositories } from '@/data/useRepositories'
import type { Review } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import s from './home.module.css'

function ReviewCard({ review }: { review: Review }) {
  if (!review.body) {
    return (
      <figure className={`${s.review} ${s.reviewEmpty}`}>
        <span className={s.quote} aria-hidden="true">
          “
        </span>
        <span className={s.skeleton} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <figcaption>후기 자리 · 이름 · 파트</figcaption>
      </figure>
    )
  }
  return (
    <figure className={s.review}>
      <span className={s.quote} aria-hidden="true">
        “
      </span>
      <blockquote>{review.body}</blockquote>
      <figcaption>
        {review.author} · {review.part}
      </figcaption>
    </figure>
  )
}

/**
 * 멤버 후기 (배범서 기획 2안: 카드가 옆으로 계속 흐름).
 * 같은 줄을 두 번 이어 붙여 끊김 없이 돌리고, 마우스를 올리면 멈춘다.
 * '동작 줄이기' 설정이면 흐르지 않고 옆으로 넘겨 본다.
 */
export function ReviewsSection() {
  const repos = useRepositories()
  const { data } = useAsync('reviews', () => repos.reviews.list())
  const reviews = data ?? []
  return (
    <section className={s.section} aria-labelledby="reviews-title">
      <div className={s.sectionHead}>
        <h2 id="reviews-title">멤버 후기</h2>
        <span className={s.note}>멤버가 직접 쓴 글만 싣습니다</span>
      </div>
      <div className={s.marquee}>
        <div className={s.marqueeTrack}>
          {[...reviews, ...reviews].map((r, i) => (
            <div key={`${r.id}-${i}`} className={s.marqueeItem} aria-hidden={i >= reviews.length}>
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
