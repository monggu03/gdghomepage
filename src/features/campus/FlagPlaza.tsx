import { memo, useEffect, useRef, useState, type RefObject } from 'react'
import type { Place, PlaceId } from '@/domain/types'
import { SITE } from '@/config/site'
import { PLACE_PANEL_ID } from '@/config/ui'
import { iso } from '@/lib/iso'
import { FLAG_BASE, FLAG_CLOTH, FLAG_POLE } from './geometry'
import { FLAG_AT } from './layout'
import { corners, cyl, dots, slab, sphere } from './anatomy/kit'
import { Dots, Solid } from './anatomy/draw'
import s from './campus.module.css'

/** 깃발에 쓰는 기수 숫자: '4기' → '4' */
const GEN_NUMBER = SITE.generation.replace(/\D/g, '')

/** 이번 브라우저 세션에서 깃발을 이미 올렸는지 (탭을 닫으면 지워진다) */
const RAISED_KEY = 'gdgoc-dgu:flag-raised'

type Raise = 'down' | 'rising' | 'up'

/** 깃대 받침 (격자) */
const BASE = { x: FLAG_AT[0] - 0.22, y: FLAG_AT[1] - 0.22, w: 0.44, d: 0.44, r: 0.05 }

/**
 * 깃발 올리기는 세션에 한 번만, 그것도 깃발이 화면에 보일 때.
 * - '동작 줄이기' 설정이면 처음부터 올라가 있다 (up)
 * - 아직 안 올렸으면 내려 둔 채(down) 기다리다가, 화면에 들어오면 한 번 올린다 (rising)
 * sessionStorage 는 사생활 보호 모드 등에서 막힐 수 있어서 try/catch 로 감싼다 (막히면 올라간 채로).
 */
function useRaiseOnce(target: RefObject<Element | null>): Raise {
  const [state, setState] = useState<Raise>(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'up'
      return window.sessionStorage.getItem(RAISED_KEY) === '1' ? 'up' : 'down'
    } catch {
      return 'up'
    }
  })
  useEffect(() => {
    const el = target.current
    if (state !== 'down' || !el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        try {
          window.sessionStorage.setItem(RAISED_KEY, '1')
        } catch {
          // 저장하지 못해도 다음 방문 때 한 번 더 올라갈 뿐이다
        }
        setState('rising')
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [state, target])
  return state
}

interface Props {
  place: Place
  selected: boolean
  hovered: boolean
  /** 검색에 걸림. 표시는 안내판이 맡는다 */
  hit: boolean
  dim: boolean
  onSelect: (id: PlaceId) => void
  onHover: (id: PlaceId | null) => void
}

/**
 * 광장 한가운데 깃발 = GDGoC DGU 소개.
 * 기수색(주황) 천에 기수 숫자를 먹색으로. 천은 깃대에서 화면 오른쪽 위(-y)로 펼쳐지고,
 * 숫자도 천과 같은 면에 눕혀 쓴다 (skewY 대신 matrix 로 아이소 면에 맞춤).
 */
export const FlagPlaza = memo(function FlagPlaza({ place, selected, hovered, dim, onSelect, onHover }: Props) {
  const flagRef = useRef<SVGGElement>(null)
  const raise = useRaiseOnce(flagRef)
  const [fx, fy] = FLAG_AT
  const [bx, by] = iso(fx, fy, FLAG_BASE)
  const top = by - FLAG_POLE
  const len = FLAG_CLOTH.len * 32
  const ch = FLAG_CLOTH.h * 32
  const c0 = top + 3
  const cloth = [
    [bx + 1, c0],
    [bx + 1 + len, c0 - len / 2],
    [bx + 1 + len, c0 - len / 2 + ch],
    [bx + 1, c0 + ch],
  ]
    .map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`)
    .join(' ')
  const cls = [s.bld, selected && s.sel, hovered && s.hov, dim && s.dim].filter(Boolean).join(' ')
  return (
    <g
      className={cls}
      data-place={place.id}
      tabIndex={0}
      role="button"
      aria-label={`${place.label} ${GEN_NUMBER}기 소개 열기`}
      aria-current={selected ? 'true' : undefined}
      aria-controls={PLACE_PANEL_ID}
      onClick={() => onSelect(place.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(place.id)
        }
      }}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(place.id)}
      onBlur={() => onHover(null)}
    >
      {/* 깃대가 가늘어서 누르기 어렵다: 보이지 않는 넓은 자리를 깐다 (폰에서도 44px 이상) */}
      <rect x={bx - 24} y={top - len / 2 - 8} width={len + 40} height={by - top + len / 2 + 22} fill="transparent" />
      <g ref={flagRef} className={s.lift}>
        {/* 받침(둥근 모서리 · 깎은 윗선 · 볼트 넷) → 깃대 고리 → 깃대(원기둥) → 꼭지(공) */}
        <Solid paths={slab(BASE, 0, FLAG_BASE, 4, 0.02)} tone="lo" />
        <Dots points={dots(corners(BASE, 0.07).map(([px, py]) => [px, py, FLAG_BASE] as const))} size={0.55} />
        <Solid paths={cyl(fx, fy, 0.075, FLAG_BASE, 0.06, 18, 0.01)} tone="mid" />
        <Solid paths={cyl(fx, fy, 0.024, FLAG_BASE + 0.06, (FLAG_POLE + 2) / 32 - 0.06, 10)} tone="mid" crease="none" />
        <Solid paths={sphere([fx, fy, FLAG_BASE + (FLAG_POLE + 3.5) / 32], 0.05, 20)} tone="mid" />
        <g
          className={raise === 'down' ? s.lowered : raise === 'rising' ? s.raise : undefined}
          style={raise === 'up' ? undefined : { ['--drop' as string]: `${(FLAG_POLE - ch - 10).toFixed(0)}px` }}
        >
          <polygon className={s.cloth} points={cloth} />
          <polygon className={s.clothEdge} points={cloth} />
          {/* 기수 숫자는 글자가 아니라 그림으로 그린다 (버튼 이름 'GDGoC DGU 4기 소개 열기' 와 따로 읽히지 않게) */}
          <g
            className={s.clothNum}
            transform={`matrix(1 -0.5 0 1 ${(bx + 1 + len / 2).toFixed(1)} ${(c0 - len / 4 + ch / 2).toFixed(1)})`}
          >
            <GenDigit n={GEN_NUMBER} />
          </g>
        </g>
      </g>
    </g>
  )
})

/**
 * 깃발 천의 기수 숫자 (높이 14 · 가운데 0,0). 0–9 를 굵은 선으로 그린다.
 * 기수가 두 자리가 되면 나란히 놓는다.
 */
const DIGITS: Record<string, string> = {
  '0': 'M0 -7C-3.6 -7 -4.6 -3.6 -4.6 0S-3.6 7 0 7S4.6 3.6 4.6 0S3.6 -7 0 -7Z',
  '1': 'M-2.6 -4.6L1 -7V7',
  '2': 'M-4.2 -3.4C-4 -5.6 -2.4 -7 0 -7C2.6 -7 4.2 -5.4 4.2 -3.3C4.2 -1.2 2.6 0.4 -4.4 7H4.6',
  '3': 'M-4.2 -7H4L-0.6 -1.4C2.6 -1.6 4.6 0.2 4.6 2.6C4.6 5.2 2.6 7 -0.2 7C-2.2 7 -3.8 6.2 -4.6 4.6',
  '4': 'M2.4 7V-7L-5 3.2H5.4',
  '5': 'M4 -7H-3.2L-3.8 -0.6C-2.8 -1.4 -1.6 -1.8 -0.2 -1.8C2.6 -1.8 4.6 0 4.6 2.6S2.6 7 -0.2 7C-2.2 7 -3.8 6.2 -4.6 4.6',
  '6': 'M2.6 -7L-3.2 0.6C-4.2 1.8 -4.6 2.6 -4.6 3.4C-4.6 5.4 -2.6 7 0 7S4.6 5.4 4.6 2.8S2.6 -1.4 0 -1.4C-1.4 -1.4 -2.6 -0.8 -3.4 0',
  '7': 'M-4.6 -7H4.6L-1.4 7',
  '8': 'M0 -0.6C-2.6 -0.6 -4.2 -2 -4.2 -3.8S-2.6 -7 0 -7S4.2 -5.6 4.2 -3.8S2.6 -0.6 0 -0.6ZM0 -0.6C-2.8 -0.6 -4.6 1 -4.6 3.2S-2.8 7 0 7S4.6 5.4 4.6 3.2S2.8 -0.6 0 -0.6Z',
  '9': 'M-2.6 7L3.2 -0.6C4.2 -1.8 4.6 -2.6 4.6 -3.4C4.6 -5.4 2.6 -7 0 -7S-4.6 -5.4 -4.6 -2.8S-2.6 1.4 0 1.4C1.4 1.4 2.6 0.8 3.4 0',
}

function GenDigit({ n }: { n: string }) {
  const step = 11.5
  const x0 = (-(n.length - 1) * step) / 2
  return (
    <>
      {[...n].map((d, i) => (
        <path key={i} d={DIGITS[d] ?? ''} transform={`translate(${x0 + i * step} 0)`} />
      ))}
    </>
  )
}
