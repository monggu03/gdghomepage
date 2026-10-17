import { iso } from '@/lib/iso'
import { CORE_REACH, opacityAt, pointAt, randomRoute, reachFor, type Reach, type Route } from './walkerEngine'

const NS = 'http://www.w3.org/2000/svg'

/** 옷은 대부분 중립색 (회색 · 남색 · 미색). 네 명 중 한 명쯤만 장소색 옷을 입는다 */
const NEUTRAL_TOPS = ['#5b6270', '#2f3a56', '#efece6', '#8a919c', '#3e4350', '#d9d6cf']
const PLACE_TOPS = ['#4285f4', '#ea4335', '#fbbc04', '#34a853']
const BOTTOMS = ['#2b3142', '#3d4454', '#55524c', '#1f2533']
const SKIN = ['#f2d4ba', '#e6c19f', '#d4a580', '#bb8a66']
const HAIR = ['#24262b', '#3b2f28', '#4a3a2e', '#1c1e24']

/** 사람 크기 배율. 건물(벽 높이 1~1.5칸) 옆에서 너무 장난감처럼 보이지 않게 */
const PERSON_SCALE = 1.05

interface Walker {
  node: SVGGElement
  body: SVGGElement
  legs: [SVGRectElement, SVGRectElement]
  route: Route
  t: number
  /** 걷는 빠르기 (격자 칸/초). 사람마다 다르다 */
  speed: number
  wait: number
  phase: number
  /** 지금 끼워 둔 자리 (바뀔 때만 DOM 을 옮긴다) */
  before: Element | null | undefined
}

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]

function make<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v))
  parent?.appendChild(el)
  return el
}

/** 사람 하나. i 번째 사람이 장소색 옷을 입을지는 i 로 정한다 (네 명 중 한 명) */
function createPerson(i: number) {
  const node = make('g', {})
  // 키는 ±6% 안에서 사람마다 다르게
  const height = PERSON_SCALE * (0.94 + Math.random() * 0.12)
  const figure = make('g', { transform: `scale(${height.toFixed(3)})` }, node)
  make('ellipse', { cx: 1.5, cy: 0.4, rx: 5.2, ry: 2, fill: 'rgba(25,27,31,.12)' }, figure)
  const body = make('g', {}, figure)
  const bottom = pick(BOTTOMS)
  const legs: [SVGRectElement, SVGRectElement] = [
    make('rect', { x: -2.7, y: -7.5, width: 2.3, height: 7.5, rx: 1.1, fill: bottom }, body),
    make('rect', { x: 0.4, y: -7.5, width: 2.3, height: 7.5, rx: 1.1, fill: bottom }, body),
  ]
  const top = i % 4 === 1 ? PLACE_TOPS[Math.floor(i / 4) % PLACE_TOPS.length] : pick(NEUTRAL_TOPS)
  const shirt = make('rect', { x: -3.6, y: -17, width: 7.2, height: 11, rx: 3, fill: top }, body)
  // 미색 옷은 밝은 땅 위에서 사라지지 않게 가는 테두리
  if (top === '#efece6' || top === '#d9d6cf') shirt.setAttribute('stroke', '#b8bec6')
  make('circle', { cx: 0, cy: -20.8, r: 3.7, fill: pick(SKIN) }, body)
  make('path', { d: 'M-3.8 -21.2 A3.8 3.8 0 0 1 3.8 -21.2 Z', fill: pick(HAIR) }, body)
  return { node, body, legs }
}

/**
 * 걷는 사람들을 직접(명령형으로) 그리는 층.
 * React 바깥의 작은 엔진이라 1초에 30번 움직여도 React 리렌더가 일어나지 않는다 (간격은 useWalkers 가 정한다).
 * 앞뒤 순서: world 의 자식마다 data-depth(앞뒤 키)가 있다. 사람의 키보다 큰 첫 자식 앞에 끼운다.
 */
export class WalkerLayer {
  private readonly world: SVGGElement
  private readonly walkers: Walker[]

  constructor(world: SVGGElement, count: number) {
    this.world = world
    const reach = this.reach()
    this.walkers = Array.from({ length: count }, (_, i) => {
      const { node, body, legs } = createPerson(i)
      world.appendChild(node)
      const route = randomRoute(Math.random, reach)
      return { node, body, legs, route, t: Math.random() * route.length, speed: 0.42 + Math.random() * 0.36, wait: 0, phase: Math.random() * 6, before: undefined }
    })
  }

  step(dt: number, time: number): void {
    const statics = Array.from(this.world.children).filter((c) => c.hasAttribute('data-depth'))
    for (const w of this.walkers) this.stepOne(w, dt, time, statics)
  }

  destroy(): void {
    for (const w of this.walkers) w.node.remove()
  }

  /** 지금 보이는 자리(viewBox) 바로 바깥에서 나타나게. 새 경로를 만들 때만 읽는다 */
  private reach(): Reach {
    const vb = this.world.ownerSVGElement?.viewBox?.baseVal
    if (!vb || !vb.width || !vb.height) return CORE_REACH
    return reachFor({ x: vb.x, y: vb.y, w: vb.width, h: vb.height })
  }

  private stepOne(w: Walker, dt: number, time: number, statics: Element[]) {
    if (w.wait > 0) {
      w.wait -= dt
      w.node.style.opacity = '0'
      if (w.wait <= 0) {
        w.route = randomRoute(Math.random, this.reach())
        w.t = 0
      }
      return
    }
    w.t += w.speed * dt
    if (w.t >= w.route.length) {
      w.wait = 0.4 + Math.random() * 2.2
      w.node.style.opacity = '0'
      return
    }
    const [x, y] = pointAt(w.route, w.t)
    const [sx, sy] = iso(x, y, 0)
    // 걸음: 몸이 살짝 오르내리고 다리가 번갈아 든다 (튀지 않게 작게)
    const step = Math.sin(time * 8 + w.phase)
    w.node.setAttribute('transform', `translate(${sx.toFixed(1)},${sy.toFixed(1)})`)
    w.body.setAttribute('transform', `translate(0,${(-Math.abs(step) * 0.8).toFixed(2)})`)
    w.legs[0].setAttribute('y', (-7.5 - Math.max(0, step) * 1.2).toFixed(2))
    w.legs[1].setAttribute('y', (-7.5 - Math.max(0, -step) * 1.2).toFixed(2))
    w.node.style.opacity = opacityAt(w.route, w.t).toFixed(2)
    const depth = x + y
    const before = statics.find((c) => Number(c.getAttribute('data-depth')) > depth) ?? null
    if (before !== w.before) {
      this.world.insertBefore(w.node, before)
      w.before = before
    }
  }
}
