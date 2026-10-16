import { useEffect, useRef } from 'react'
import { PLACES, placeColor } from '@/config/places'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { useCampus, useCampusActions } from '@/state/useCampus'
import { PLACE_PANEL_ID } from './shared'
import s from './hud.module.css'

/**
 * 폰에서 지도 아래 보이는 장소 카드 줄. 지도를 못 눌러도 글자로 고를 수 있게 한다.
 * 고른 카드를 가운데로 옮길 때 scrollIntoView 를 쓰지 않는다:
 * 그러면 부모(첫 화면)까지 옆으로 밀려 화면이 깨진다. 이 줄만 직접 스크롤한다.
 */
export function PlaceStrip() {
  const { selected } = useCampus()
  const { select } = useCampusActions()
  const reduce = useReducedMotion()
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row = rowRef.current
    const card = row?.querySelector<HTMLElement>(`[data-place="${selected}"]`)
    if (!row || !card) return
    row.scrollTo({ left: card.offsetLeft - (row.clientWidth - card.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' })
  }, [selected, reduce])

  return (
    <div ref={rowRef} className={s.strip} role="group" aria-label="지도 장소 고르기">
      {PLACES.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-current={selected === p.id ? 'true' : undefined}
          aria-controls={PLACE_PANEL_ID}
          data-place={p.id}
          className={`${s.stripCard} ${selected === p.id ? s.stripOn : ''}`}
          onClick={() => select(p.id)}
        >
          <i style={{ background: placeColor(p.id) }} />
          <span>
            <b>{p.label}</b>
            <small>{p.sub}</small>
          </span>
        </button>
      ))}
    </div>
  )
}
