import { resolvePath, type createBrowserRouter } from 'react-router-dom'
import { PLACES } from '@/config/places'
import type { PlaceId } from '@/domain/types'

type AppRouter = ReturnType<typeof createBrowserRouter>

/**
 * data-vt 를 지우는 시간. 새 페이지를 그리는 시간(느린 폰에서 1초 가까이) + 가장 긴 전환(420ms)보다 넉넉하게.
 * 다음 이동이 오면 그때 다시 정하므로 늦게 지워져도 문제없다 (일찍 지워지면 그 전환만 기본 전환으로 바뀐다)
 */
const CLEAR_AFTER_MS = 2500

/** '/projects' → 'projects'. 홈 · 그 밖의 주소는 null */
export function placeOfPath(pathname: string): PlaceId | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return null
  return PLACES.find((p) => p.path !== '/' && (path === p.path || path.startsWith(`${p.path}/`)))?.id ?? null
}

/**
 * 어떤 전환을 쓸지: 홈 ↔ 장소 페이지면 건물 쪽으로 들어가기(enter) · 물러나기(leave), 나머지는 그냥 바꾸기(plain).
 * 주소 이름(pathname)이 같으면(?p= 로 자세히 보기 창만 여닫기 등) 전환하지 않는다(null).
 */
export function transitionKind(from: string, to: string): { kind: 'enter' | 'leave' | 'plain'; place: PlaceId | null } | null {
  if (from === to) return null
  const fromHome = (from.replace(/\/+$/, '') || '/') === '/'
  const toHome = (to.replace(/\/+$/, '') || '/') === '/'
  if (fromHome && placeOfPath(to)) return { kind: 'enter', place: placeOfPath(to) }
  if (toHome && placeOfPath(from)) return { kind: 'leave', place: placeOfPath(from) }
  return { kind: 'plain', place: null }
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 홈 지도의 그 건물 가운데 (화면 기준 px). 건물이 화면에 충분히 보이지 않으면 null */
function buildingCenter(place: PlaceId): { x: number; y: number } | null {
  const el = document.querySelector(`main [data-place="${place}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  const inView = cx > 0 && cx < window.innerWidth && cy > 64 && cy < window.innerHeight
  return inView && r.width > 0 ? { x: Math.round(cx), y: Math.round(cy) } : null
}

/**
 * 페이지를 옮길 때 View Transitions 를 켠다 (지원하지 않는 브라우저 · '동작 줄이기'는 그대로 바로 바뀐다).
 * - 모든 링크(Link · NavLink · navigate)가 router.navigate 를 거치므로 여기서 한 번에 켠다: 링크마다 viewTransition 을 달지 않아도 된다.
 *   링크가 viewTransition 을 직접 정했으면(true/false) 그 값을 따른다.
 * - 뒤로 · 앞으로 가기는 react-router 가 앞서 쓴 전환을 거꾸로 다시 쓴다.
 * - 홈 지도에 그 건물이 보이면 건물 가운데를 기준점으로 넘긴다 (styles/global.css 의 enter · leave).
 *   돌아올 때는 들어갈 때 잰 기준점을 다시 쓴다 (ScrollRestoration 이 같은 스크롤 위치로 돌려놓는다).
 */
export function enableViewTransitions(router: AppRouter) {
  if (typeof document === 'undefined' || typeof document.startViewTransition !== 'function') return
  const root = document.documentElement
  const origins = new Map<PlaceId, { x: number; y: number }>()
  let timer = 0

  const mark = (from: string, to: string) => {
    const t = transitionKind(from, to)
    if (!t) return
    let kind = t.kind
    let origin: { x: number; y: number } | null = null
    if (t.kind === 'enter' && t.place) {
      origin = buildingCenter(t.place)
      if (origin) origins.set(t.place, origin)
      else origins.delete(t.place)
    } else if (t.kind === 'leave' && t.place) {
      origin = origins.get(t.place) ?? null
    }
    if (!origin) kind = 'plain'
    root.dataset.vt = kind
    if (origin) {
      root.style.setProperty('--vt-x', `${origin.x}px`)
      root.style.setProperty('--vt-y', `${origin.y}px`)
    }
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      delete root.dataset.vt
      root.style.removeProperty('--vt-x')
      root.style.removeProperty('--vt-y')
    }, CLEAR_AFTER_MS)
  }

  // 새 상태를 그리기 직전(옛 화면이 아직 있을 때) 불린다: 전환이 켜진 이동만 표시한다
  router.subscribe((state, { viewTransitionOpts }) => {
    if (!viewTransitionOpts) return
    mark(viewTransitionOpts.currentLocation.pathname, state.location.pathname)
  })

  const navigate = router.navigate
  router.navigate = ((to: Parameters<AppRouter['navigate']>[0], opts?: Parameters<AppRouter['navigate']>[1]) => {
    if (typeof to === 'number') return navigate(to)
    if (opts?.viewTransition !== undefined || reduceMotion() || to === null) return navigate(to, opts)
    const from = router.state.location.pathname
    const next = resolvePath(to, from).pathname
    return navigate(to, next === from ? opts : { ...opts, viewTransition: true })
  }) as AppRouter['navigate']
}
