import { iso } from '@/lib/iso'
import { PEEPS, WALK_LEGS, WALK_POSES, peepSymbolId, type PeepLegs } from '../peeps/peepArt'
import { CORE_REACH, opacityAt, pointAt, randomRoute, reachFor, type Reach, type Route } from './walkerEngine'

const NS = 'http://www.w3.org/2000/svg'

/**
 * 사람 = Open Peeps (Pablo Stanley, CC0) 걷는 자세 넷. 선으로 그린 사람이 반듯한 아이소 건물 사이를 걷는다
 * (건축 투시도에 손으로 그려 넣는 '점경 인물'처럼). 그림은 <symbol> 로 한 번만 넣고 <use> 로 불러 노드 수를 줄인다.
 */
const PEEP_H = 37
const INK = '#1d1f24'
let clipSeq = 0

/** 다리 하나: 바지(테두리 · 안쪽) + 신발 */
interface Leg {
  outer: SVGPathElement
  inner: SVGPathElement | null
  shoe: SVGPathElement
}

/** 움직이는 다리 한 벌 (허리 · 길이 · 굵기는 그림 크기에 맞춘 화면 단위) */
interface Legs {
  hipX: number
  hipY: number
  thigh: number
  shin: number
  width: number
  legs: [Leg, Leg]
}

interface Walker {
  node: SVGGElement
  /** 좌우 뒤집기 (원본 그림은 오른쪽을 보고 걷는다) */
  flip: SVGGElement
  body: SVGGElement
  legs: Legs
  route: Route
  t: number
  /** 걷는 빠르기 (격자 칸/초). 사람마다 다르다 */
  speed: number
  wait: number
  phase: number
  /** 지금 보는 쪽 (1 = 오른쪽) */
  facing: -1 | 1
  lastX: number
  /** 지금 끼워 둔 자리 (바뀔 때만 DOM 을 옮긴다) */
  before: Element | null | undefined
}

function make<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v))
  parent?.appendChild(el)
  return el
}

function makeLeg(spec: PeepLegs, width: number, parent: SVGGElement): Leg {
  const line = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }
  const outer = make('path', { ...line, stroke: INK, 'stroke-width': width.toFixed(2) }, parent)
  const inner = spec.pants === 'light' ? make('path', { ...line, stroke: '#fff', 'stroke-width': (width * 0.5).toFixed(2) }, parent) : null
  const shoe = make('path', { ...line, stroke: INK, 'stroke-width': (width * 0.72).toFixed(2) }, parent)
  return { outer, inner, shoe }
}

/** 사람 하나: 그림자 + (뒤집기 → 몸 → 다리 + 허리 위 그림) */
function createPerson(i: number) {
  const node = make('g', {})
  make('ellipse', { cx: 0, cy: 0.4, rx: 7.5, ry: 2.4, fill: 'rgba(25,27,31,.13)' }, node)
  const flip = make('g', {}, node)
  const body = make('g', {}, flip)
  const pose = WALK_POSES[i % WALK_POSES.length]
  const { w, h } = PEEPS[pose]
  const spec = WALK_LEGS[pose]
  const H = PEEP_H * (0.95 + Math.random() * 0.08)
  const Wd = (H * w) / h
  const x0 = -Wd / 2
  const y0 = -H
  // 다리를 먼저 (셔츠 밑단이 다리 윗부분을 덮게)
  const legBox = make('g', {}, body)
  const width = spec.width * H
  const legs: [Leg, Leg] = [makeLeg(spec, width, legBox), makeLeg(spec, width, legBox)]
  // 허리 위만 보이는 원래 그림
  const id = `peep-clip-${++clipSeq}`
  const clip = make('clipPath', { id }, body)
  make('rect', { x: (x0 - 4).toFixed(1), y: (y0 - 4).toFixed(1), width: (Wd + 8).toFixed(1), height: (spec.clip * H + 4).toFixed(1) }, clip)
  // (clip-path 를 <use> 에 바로 걸면 use 의 x · y 만큼 가림 틀도 밀린다. 감싼 g 에 건다)
  const upper = make('g', { 'clip-path': `url(#${id})` }, body)
  make('use', { href: `#${peepSymbolId(pose)}`, x: x0.toFixed(1), y: y0.toFixed(1), width: Wd.toFixed(1), height: H.toFixed(1) }, upper)
  const hipY = y0 + spec.hipY * H
  // 허리에서 발목까지: 발목은 땅(0)에서 신발 높이만큼 위
  const reach = -hipY - width * 0.45
  return { node, flip, body, legs: { hipX: x0 + spec.hipX * Wd, hipY, thigh: reach * 0.52, shin: reach * 0.48, width, legs } }
}

/**
 * 걸음 한 장면: phase(라디안)에 따라 두 다리가 반대로 흔들린다.
 * 넓적다리는 앞뒤로 ±24°, 다리를 앞으로 내미는 동안 무릎이 굽는다. 땅을 딛는 다리가 바닥에 닿도록 몸 높이를 돌려준다.
 * stand 면 두 다리를 모으고 선다.
 */
function poseLegs(L: Legs, phase: number, stand: boolean): number {
  let lowest = 0
  const pts: Array<[number, number, number, number, number, number]> = []
  for (let k = 0; k < 2; k++) {
    const ph = phase + k * Math.PI
    const th = stand ? (k ? -0.04 : 0.04) : 0.42 * Math.sin(ph)
    const bend = stand ? 0 : 0.62 * Math.max(0, Math.cos(ph)) * (0.6 + 0.4 * Math.max(0, Math.sin(ph) + 0.3))
    const kx = L.hipX + L.thigh * Math.sin(th)
    const ky = L.hipY + L.thigh * Math.cos(th)
    const sa = th - bend
    const ax = kx + L.shin * Math.sin(sa)
    const ay = ky + L.shin * Math.cos(sa)
    lowest = Math.max(lowest, ay)
    pts.push([kx, ky, ax, ay, sa, th])
  }
  // 딛는 다리(더 아래 발목)가 땅에 닿도록 몸을 내린다
  const drop = L.hipY + L.thigh + L.shin - lowest
  pts.forEach(([kx, ky, ax, ay, sa], k) => {
    const leg = L.legs[k]
    const d = `M${L.hipX.toFixed(2)} ${L.hipY.toFixed(2)}L${kx.toFixed(2)} ${ky.toFixed(2)}L${ax.toFixed(2)} ${ay.toFixed(2)}`
    leg.outer.setAttribute('d', d)
    leg.inner?.setAttribute('d', d)
    // 신발: 발목에서 앞으로 (발을 들어 올리는 동안은 발끝이 조금 아래로)
    const toe = L.width * 1.25
    const tilt = Math.max(-0.35, Math.min(0.5, -sa * 0.6))
    leg.shoe.setAttribute('d', `M${(ax - L.width * 0.25).toFixed(2)} ${ay.toFixed(2)}L${(ax + toe * Math.cos(tilt)).toFixed(2)} ${(ay + toe * Math.sin(tilt)).toFixed(2)}`)
  })
  return drop
}

/**
 * 걷는 사람들을 직접(명령형으로) 그리는 층.
 * React 바깥의 작은 엔진이라 1초에 30번 움직여도 React 리렌더가 일어나지 않는다 (간격은 useWalkers 가 정한다).
 * 앞뒤 순서: world 의 자식마다 data-depth(앞뒤 키)가 있다. 사람의 키보다 큰 첫 자식 앞에 끼운다.
 */
export class WalkerLayer {
  private readonly world: SVGGElement
  private readonly walkers: Walker[]
  /** 마우스를 올린 건물 (화면 x). 그동안 사람들이 멈춰 그쪽을 본다 */
  private focus: { x: number; since: number } | null = null
  private now = 0

  constructor(world: SVGGElement, count: number) {
    this.world = world
    const reach = this.reach()
    this.walkers = Array.from({ length: count }, (_, i) => {
      const { node, flip, body, legs } = createPerson(i)
      world.appendChild(node)
      const route = randomRoute(Math.random, reach)
      return { node, flip, body, legs, route, t: Math.random() * route.length, speed: 0.42 + Math.random() * 0.36, wait: 0, phase: Math.random() * 6, facing: 1 as const, lastX: NaN, before: undefined }
    })
  }

  /** 건물에 마우스를 올리면 사람들이 멈춰 그쪽을 돌아보고 한 번 폴짝 뛴다. null 이면 다시 걷는다 */
  setFocus(x: number | null): void {
    if (x === null) this.focus = null
    else if (!this.focus || this.focus.x !== x) this.focus = { x, since: this.now }
  }

  step(dt: number, time: number): void {
    this.now = time
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
    const focus = this.focus
    if (!focus) w.t += w.speed * dt
    if (w.t >= w.route.length) {
      w.wait = 0.4 + Math.random() * 2.2
      w.node.style.opacity = '0'
      return
    }
    const [x, y] = pointAt(w.route, w.t)
    const [sx, sy] = iso(x, y, 0)
    w.node.setAttribute('transform', `translate(${sx.toFixed(1)},${sy.toFixed(1)})`)
    // 보는 쪽: 걸을 때는 가는 쪽, 멈췄을 때는 마우스를 올린 건물 쪽
    const dx = focus ? focus.x - sx : sx - w.lastX
    w.lastX = sx
    const facing: -1 | 1 = Math.abs(dx) < 0.01 ? w.facing : dx > 0 ? 1 : -1
    if (facing !== w.facing) {
      w.facing = facing
      // 그림은 오른쪽을 본다. 왼쪽으로 갈 때만 뒤집는다 (안 그러면 뒷걸음질)
      w.flip.setAttribute('transform', facing === -1 ? 'scale(-1,1)' : '')
    }
    if (focus) {
      // 돌아본 뒤 0.45초 동안 두 번 폴짝, 그다음은 가만히 (다리는 모은다)
      const k = time - focus.since
      const hop = k < 0.45 ? Math.abs(Math.sin(k * 14 + w.phase * 0.1)) * 3.2 : 0
      const drop = poseLegs(w.legs, 0, true)
      w.body.setAttribute('transform', `translate(0,${(drop - hop).toFixed(2)})`)
    } else {
      // 걸음: 걸은 거리에 맞춰 다리가 앞뒤로 (미끄러지지 않게 걸음 수를 거리에 묶는다). 딛는 발이 땅에 닿도록 몸이 오르내린다
      const drop = poseLegs(w.legs, w.t * 9.5 + w.phase, false)
      w.body.setAttribute('transform', `translate(0,${drop.toFixed(2)})`)
    }
    w.node.style.opacity = opacityAt(w.route, w.t).toFixed(2)
    const depth = x + y
    const before = statics.find((c) => Number(c.getAttribute('data-depth')) > depth) ?? null
    if (before !== w.before) {
      this.world.insertBefore(w.node, before)
      w.before = before
    }
  }
}
