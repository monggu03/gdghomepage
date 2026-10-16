import { useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PLACE_BY_ID } from '@/config/places'
import { useRepositories } from '@/data/useRepositories'
import type { PlaceId, SearchHit } from '@/domain/types'
import { useCampusActions } from '@/state/useCampus'
import s from './hud.module.css'

/**
 * 아카이브 검색. 결과가 나오면 지도에서 해당 건물이 빛나고 핀에 건수가 뜬다.
 * 검색 방법(키워드/Gemini)은 SearchService 가 정하고, 이 컴포넌트는 결과만 그린다.
 */
export function SearchBox({ className = '' }: { className?: string }) {
  const { search } = useRepositories()
  const { setHits, select } = useCampusActions()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')
  const [hits, setLocalHits] = useState<SearchHit[]>([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLFormElement>(null)
  const listId = useId()

  // 입력이 멈추고 0.15초 뒤에 찾는다 (글자마다 서버를 부르지 않게)
  useEffect(() => {
    const q = query.trim()
    if (!q) return
    let alive = true
    const timer = window.setTimeout(async () => {
      const result = await search.search(q)
      if (!alive) return
      setLocalHits(result)
      const perPlace: Partial<Record<PlaceId, number>> = {}
      for (const h of result) perPlace[h.doc.place] = (perPlace[h.doc.place] ?? 0) + 1
      setHits(result.length ? perPlace : null)
      setOpen(true)
    }, 150)
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
    setLocalHits([])
    setHits(null)
  }

  const choose = (place: PlaceId) => {
    setOpen(false)
    if (pathname === '/') select(place)
    else navigate(PLACE_BY_ID[place].path)
  }

  return (
    <form
      ref={boxRef}
      role="search"
      className={`${s.search} ${className}`}
      onSubmit={(e) => {
        e.preventDefault()
        if (hits[0]) choose(hits[0].doc.place)
      }}
    >
      <svg className={s.spark} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2c.7 5.3 4.7 9.3 10 10-5.3.7-9.3 4.7-10 10-.7-5.3-4.7-9.3-10-10 5.3-.7 9.3-4.7 10-10z" />
      </svg>
      <input
        type="search"
        value={query}
        placeholder="예: Spring Boot 세션 자료"
        aria-label="활동 아카이브 검색"
        aria-controls={listId}
        aria-expanded={open}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value)
          if (!e.target.value.trim()) clear()
        }}
        onFocus={() => query.trim() && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setQuery('')
            setOpen(false)
            clear()
          }
        }}
      />
      <span className={s.engine}>{search.name === 'Gemini' ? 'Gemini' : 'Gemini 예시'}</span>
      {open && query.trim() && (
        <div id={listId} className={s.results}>
          <div className={s.resultsHead}>
            <span>{search.name === 'Gemini' ? 'Gemini 검색' : 'Gemini 검색 · 예시 동작 (키워드 일치)'}</span>
            <span>{hits.length}건</span>
          </div>
          {hits.length === 0 ? (
            <p className={s.none}>맞는 자료가 없습니다. 다른 단어로 찾아보세요.</p>
          ) : (
            hits.slice(0, 6).map(({ doc }) => {
              const place = PLACE_BY_ID[doc.place]
              return (
                <button type="button" key={`${doc.place}-${doc.title}`} className={s.result} onClick={() => choose(doc.place)}>
                  <i style={{ background: place.id === 'about' ? 'var(--ink)' : place.color }} />
                  <span className={s.resultTitle}>{doc.title}</span>
                  <span className={s.resultPlace}>{place.label}</span>
                  <span className={s.resultMeta}>
                    {doc.meta}
                    {doc.sample && <span className="sample-badge">예시</span>}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </form>
  )
}
