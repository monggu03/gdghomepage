import { memo, useLayoutEffect, useRef, useState } from 'react'
import type { Place, PlaceId } from '@/domain/types'
import { useFontsReady } from '@/hooks/useFontsReady'
import { placeColor } from '@/config/places'
import { iso, type Point3 } from '@/lib/iso'
import s from './campus.module.css'

interface Props {
  place: Place
  at: Point3
  /** 장면이 작게 그려질 때 키우는 배율 */
  scale: number
  /** 화면 오른쪽 장소는 이름표를 왼쪽으로 돌린다 (폰에서 잘리지 않게) */
  flip: boolean
  /** '진행 중' 표시를 보일지 (폰에서는 이름표가 겹치지 않게 뺀다) */
  showLive: boolean
  selected: boolean
  lifted: boolean
  dim: boolean
  /** 검색 건수. 0 이면 숨김 */
  count: number
  onSelect: (id: PlaceId) => void
  onHover: (id: PlaceId | null) => void
}

const MARKER = 'M0 14 C-9 2 -12 -3 -12 -9 A12 12 0 1 1 12 -9 C12 -3 9 2 0 14Z'

/**
 * 이름표 핀. 가만히 있다가 건물이나 핀에 마우스를 올리면 살짝 올라온다.
 * 글자 폭은 실제로 그려 봐야 알 수 있어서, 그린 직후(useLayoutEffect)와 글꼴을 다 받은 뒤 다시 잰다.
 */
export const Pin = memo(function Pin({ place, at, scale, flip, showLive, selected, lifted, dim, count, onSelect, onHover }: Props) {
  const fontsReady = useFontsReady()
  const textRef = useRef<SVGTextElement>(null)
  const liveRef = useRef<SVGTextElement>(null)
  const [tw, setTw] = useState(60)
  const [lw, setLw] = useState(36)

  useLayoutEffect(() => {
    if (textRef.current) setTw(textRef.current.getComputedTextLength())
    if (liveRef.current) setLw(liveRef.current.getComputedTextLength() + 24)
  }, [fontsReady, place.label])

  const [px, py] = iso(at[0], at[1], at[2] ?? 0)
  const color = placeColor(place.id)
  const live = place.live && showLive
  const width = tw + 24 + (live ? lw + 6 : 0)
  const cx = flip ? -18 - width : 18
  const dy = flip ? -14 : 0
  const cls = [s.pin, selected && s.pinSel, lifted && s.pinLift, dim && s.dim].filter(Boolean).join(' ')

  return (
    <g
      className={cls}
      transform={`translate(${px.toFixed(1)},${py.toFixed(1)})`}
      onClick={() => onSelect(place.id)}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      aria-hidden="true"
    >
      <g transform={scale === 1 ? undefined : `scale(${scale.toFixed(2)})`}>
        <g className={s.lift}>
          <path d={MARKER} style={{ fill: color }} />
          <circle cx={0} cy={-9} r={4.5} className={s.markerHole} />
          <rect className={s.chip} x={cx} y={-22 + dy} rx={13} height={26} width={width} style={{ stroke: color }} />
          <text ref={textRef} className={s.chipText} x={cx + 12} y={-4.5 + dy}>
            {place.label}
          </text>
          {live && (
            <g transform={`translate(${(cx + 12 + tw + 8).toFixed(1)},${dy})`}>
              <rect className={s.liveBg} x={0} y={-18} rx={9} height={18} width={lw} />
              <circle className={s.liveDot} cx={9} cy={-9} r={3} />
              <text ref={liveRef} className={s.liveText} x={16} y={-5}>
                진행 중
              </text>
            </g>
          )}
          {count > 0 && (
            <g>
              <circle className={s.countBg} cx={10} cy={-21} r={9.5} />
              <text className={s.countText} x={10} y={-17.2} textAnchor="middle">
                {count}
              </text>
            </g>
          )}
        </g>
      </g>
    </g>
  )
})
