import { iso } from '@/lib/iso'
import { opacityAt, pointAt, randomRoute, type Route } from './walkerEngine'

const NS = 'http://www.w3.org/2000/svg'
const SHIRTS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#5F6B8A', '#FF6309']
const HAIR = ['#2F3446', '#5A4636', '#1E2230', '#7A5A3A']

interface Walker {
  node: SVGGElement
  body: SVGGElement
  route: Route
  t: number
  speed: number
  wait: number
  phase: number
  /** 지금 끼워 둔 자리 (바뀔 때만 DOM 을 옮긴다) */
  before: Element | null | undefined
}

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]

function make<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element) {
  const el = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v))
  parent?.appendChild(el)
  return el
}

function createPerson(): { node: SVGGElement; body: SVGGElement } {
  const node = make('g', {})
  make('ellipse', { cx: 0, cy: 0, rx: 6, ry: 3, fill: 'rgba(30,40,90,.16)' }, node)
  const body = make('g', {}, node)
  make('rect', { x: -3.6, y: -16, width: 7.2, height: 12, rx: 3.6, fill: pick(SHIRTS) }, body)
  make('rect', { x: -3, y: -6, width: 2.4, height: 6, rx: 1.2, fill: '#3B4256' }, body)
  make('rect', { x: 0.6, y: -6, width: 2.4, height: 6, rx: 1.2, fill: '#3B4256' }, body)
  make('circle', { cx: 0, cy: -20, r: 4.3, fill: '#F3D5B8' }, body)
  make('path', { d: 'M-4.4 -20.5 A4.4 4.4 0 0 1 4.4 -20.5 Z', fill: pick(HAIR) }, body)
  return { node, body }
}

/**
 * 걷는 사람들을 직접(명령형으로) 그리는 층.
 * React 바깥의 작은 엔진이라 1초에 60번 움직여도 React 리렌더가 일어나지 않는다.
 * 앞뒤 순서: world 의 자식마다 data-depth(앞뒤 키)가 있다. 사람의 키보다 큰 첫 자식 앞에 끼운다.
 */
export class WalkerLayer {
  private readonly world: SVGGElement
  private readonly walkers: Walker[]

  constructor(world: SVGGElement, count: number) {
    this.world = world
    this.walkers = Array.from({ length: count }, () => {
      const { node, body } = createPerson()
      world.appendChild(node)
      const route = randomRoute()
      return { node, body, route, t: Math.random() * route.length, speed: 0.55 + Math.random() * 0.3, wait: 0, phase: Math.random() * 6, before: undefined }
    })
  }

  step(dt: number, time: number): void {
    const statics = Array.from(this.world.children).filter((c) => c.hasAttribute('data-depth'))
    for (const w of this.walkers) this.stepOne(w, dt, time, statics)
  }

  destroy(): void {
    for (const w of this.walkers) w.node.remove()
  }

  private stepOne(w: Walker, dt: number, time: number, statics: Element[]) {
    if (w.wait > 0) {
      w.wait -= dt
      w.node.style.opacity = '0'
      if (w.wait <= 0) {
        w.route = randomRoute()
        w.t = 0
      }
      return
    }
    w.t += w.speed * dt
    if (w.t >= w.route.length) {
      w.wait = 0.5 + Math.random() * 2.5
      w.node.style.opacity = '0'
      return
    }
    const [x, y] = pointAt(w.route, w.t)
    const [sx, sy] = iso(x, y, 0)
    const bob = Math.abs(Math.sin(time * 9 + w.phase)) * 1.6
    w.node.setAttribute('transform', `translate(${sx.toFixed(1)},${sy.toFixed(1)})`)
    w.body.setAttribute('transform', `translate(0,${(-bob).toFixed(1)})`)
    w.node.style.opacity = opacityAt(w.route, w.t).toFixed(2)
    const depth = x + y
    const before = statics.find((c) => Number(c.getAttribute('data-depth')) > depth) ?? null
    if (before !== w.before) {
      this.world.insertBefore(w.node, before)
      w.before = before
    }
  }
}
