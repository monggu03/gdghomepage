import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PLACE_BY_ID, placeColor } from '@/config/places'
import { useRepositories } from '@/data/useRepositories'
import type { PlaceId, SearchHit } from '@/domain/types'
import { useCampusActions } from '@/state/useCampus'
import s from './hud.module.css'

/** 입력이 멈추고 이만큼 뒤에 찾는다 (글자마다 서버를 부르지 않게) */
const DEBOUNCE_MS = 250
const MAX_RESULTS = 6

interface Props {
  className?: string
  autoFocus?: boolean
  /** 폰에서 접는 검색창일 때: Esc 로 비운 뒤 한 번 더 누르면 닫는다 */
  onClose?: () => void
}

/**
 * 아카이브 검색 (콤보박스).
 * 결과가 나오면 지도에서 해당 건물이 빛나고 핀에 건수가 뜬다.
 * 키보드: ↓↑ 로 결과 이동, Enter 로 열기, Esc 로 목록 닫기 → 한 번 더 누르면 검색어 지우기.
 */
export function SearchBox({ className = '', autoFocus = false, onClose }: Props) {
  const { search } = useRepositories()
  const { setHits, select } = useCampusActions()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')
  const [hits, setLocalHits] = useState<SearchHit[]>([])
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const boxRef = useRef<HTMLFormElement>(null)
  const listId = useId()
  const optionId = (i: number) => `${listId}-opt-${i}`
  const shown = hits.slice(0, MAX_RESULTS)

  useEffect(() => {
    const q = query.trim()
    if (!q) return
    let alive = true
    const timer = window.setTimeout(async () => {
      try {
        const result = await search.search(q)
        if (!alive) return
        setFailed(false)
        setLocalHits(result)
        const perPlace: Partial<Record<PlaceId, number>> = {}
        for (const h of result) perPlace[h.doc.place] = (perPlace[h.doc.place] ?? 0) + 1
        setHits(result.length ? perPlace : null)
      } catch {
        if (!alive) return
        setFailed(true)
        setLocalHits([])
        setHits(null)
      }
      setActive(-1)
      setOpen(true)
    }, DEBOUNCE_MS)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [query, search, setHits])

  // 바깥을 누르면 목록만 닫는다 (지도 하이라이트는 검색어를 지울 때까지 유지)
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  const clear = () => {
    setQuery('')
    setLocalHits([])
    setFailed(false)
    setActive(-1)
    setHits(null)
  }

  const choose = (place: PlaceId) => {
    setOpen(false)
    if (pathname === '/') select(place)
    else navigate(PLACE_BY_ID[place].path)
  }

  const expanded = open && query.trim().length > 0
  const status = !query.trim() ? '' : failed ? '검색을 할 수 없습니다' : `검색 결과 ${hits.length}건`

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!shown.length) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i + step + shown.length) % shown.length)
    } else if (e.key === 'Escape') {
      if (expanded) setOpen(false)
      else if (query) clear()
      else onClose?.()
    }
  }

  return (
    <form
      ref={boxRef}
      role="search"
      className={`${s.search} ${className}`}
      onSubmit={(e) => {
        e.preventDefault()
        const pick = shown[active] ?? shown[0]
        if (pick) choose(pick.doc.place)
      }}
    >
      <svg className={s.spark} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4.5 4.5" />
      </svg>
      <input
        type="search"
        role="combobox"
        value={query}
        placeholder="세션 · 행사 · 프로젝트 검색"
        aria-label="활동 검색"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={expanded}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        // 폰에서 돋보기 버튼을 눌러 열었을 때만 바로 입력할 수 있게 한다
        autoFocus={autoFocus}
        onChange={(e) => {
          setQuery(e.target.value)
          if (!e.target.value.trim()) clear()
        }}
        onFocus={() => query.trim() && setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <span className="visually-hidden" role="status">
        {status}
      </span>
      <div id={listId} className={s.results} hidden={!expanded}>
        <div className={s.resultsHead} aria-hidden="true">
          <span>검색 결과</span>
          <span>{hits.length}건</span>
        </div>
        {failed ? (
          <p className={s.none}>지금은 검색을 할 수 없습니다. 잠시 뒤 다시 시도해 주세요.</p>
        ) : shown.length === 0 ? (
          <p className={s.none}>맞는 자료가 없습니다. 다른 단어로 찾아보세요.</p>
        ) : (
          <ul role="listbox" aria-label="검색 결과">
            {shown.map(({ doc }, i) => (
              <li
                key={doc.id}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                className={`${s.result} ${i === active ? s.resultActive : ''}`}
                onPointerMove={() => setActive(i)}
                onClick={() => choose(doc.place)}
              >
                <i style={{ background: placeColor(doc.place) }} />
                <span className={s.resultTitle}>{doc.title}</span>
                <span className={s.resultPlace}>{PLACE_BY_ID[doc.place].label}</span>
                <span className={s.resultMeta}>
                  {doc.meta}
                  {doc.sample && <span className="sample-badge">예시</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  )
}
