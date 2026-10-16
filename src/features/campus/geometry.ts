import { PLACES } from '@/config/places'
import type { Footprint, Place } from '@/domain/types'
import type { Box } from '@/lib/fit'
import { iso, type Point3 } from '@/lib/iso'
import { FLAG_AT, RIGHT_SIDE_THRESHOLD } from './layout'
import { ROOFS } from './roofs'

/** 건물 받침대 높이. 벽은 이 위에서 시작한다 */
export const FLOOR = 0.12

/** 광장 깃대 높이 (SVG 단위) */
export const FLAG_POLE = 68

/** 지붕 꼭대기 위 이름표 핀 자리 (격자 좌표) */
export function pinAnchor(fp: Footprint): Point3 {
  return [fp.x + fp.w / 2, fp.y + fp.d / 2, FLOOR + fp.h + ROOFS[fp.roof].height + fp.pinGap]
}

/** 깃발 꼭대기 위 이름표 자리 */
export const FLAG_PIN: Point3 = [FLAG_AT[0], FLAG_AT[1], 2.75]

/** 이 장소의 이름표를 왼쪽으로 돌릴지 (화면 오른쪽 끝 장소만) */
export function isRightSide(at: Point3): boolean {
  return at[0] - at[1] > RIGHT_SIDE_THRESHOLD
}

/**
 * 이름표 글자 폭 어림값 (13px 글꼴 기준, SVG 단위).
 * 실제 폭은 Pin 이 그린 뒤 재지만, 장면을 놓을 자리를 정할 때는 그리기 전이라 어림값을 쓴다.
 */
export function estimateLabelWidth(label: string): number {
  let w = 0
  for (const ch of label) w += /[ㄱ-힝]/.test(ch) ? 13 : /[A-Z]/.test(ch) ? 9 : 7.5
  return w
}

/** '진행 중' 표시 폭 (글자 + 여백 + 사이 간격) */
const LIVE_WIDTH = 64

export interface TargetOptions {
  /** 이름표 확대 배율 (pinScaleFor) */
  pinScale: number
  /** 오른쪽 장소 이름표를 왼쪽으로 돌렸는지 */
  flip: boolean
  /** 이름표에 '진행 중' 표시가 있는지 */
  showLive: boolean
}

/** 이름표 하나가 차지하는 자리 (핀 끝 기준, 호버로 올라온 높이 포함) */
function pinBox(place: Place, at: Point3, { pinScale: k, flip, showLive }: TargetOptions): Box {
  const [px, py] = iso(at[0], at[1], at[2] ?? 0)
  const width = estimateLabelWidth(place.label) + 24 + (place.live && showLive ? LIVE_WIDTH : 0)
  const flipped = flip && isRightSide(at)
  return flipped
    ? { x0: px - (18 + width) * k, x1: px + 12 * k, y0: py - 45 * k, y1: py + 14 * k }
    : { x0: px - 12 * k, x1: px + (18 + width) * k, y0: py - 31 * k, y1: py + 14 * k }
}

/** 건물 하나(받침대 ~ 지붕 꼭대기)가 화면에서 차지하는 자리 */
function buildingBox(fp: Footprint): Box {
  const x0 = fp.x - 0.15
  const y0 = fp.y - 0.15
  const x1 = fp.x + fp.w + 0.15
  const y1 = fp.y + fp.d + 0.15
  const top = FLOOR + fp.h + ROOFS[fp.roof].height
  return { x0: (x0 - y1) * 32, x1: (x1 - y0) * 32, y0: (x0 + y0) * 16 - top * 32, y1: (x1 + y1) * 16 }
}

/**
 * 카드에 가려지면 안 되는 것들: 건물, 깃발, 이름표 (SVG 좌표).
 * 장면을 화면에 놓을 때(fitAvoiding) 이 상자들이 카드와 겹치지 않게 한다. 땅 · 나무 · 사람은 가려져도 된다.
 */
export function sceneTargets(opts: TargetOptions): Box[] {
  const [bx, by] = iso(FLAG_AT[0], FLAG_AT[1], 0)
  const flag: Box = { x0: bx - 16, x1: bx + 54, y0: by - FLAG_POLE - 8, y1: by + 8 }
  return [
    flag,
    ...PLACES.flatMap((p) =>
      p.footprint ? [buildingBox(p.footprint), pinBox(p, pinAnchor(p.footprint), opts)] : [pinBox(p, FLAG_PIN, opts)],
    ),
  ]
}
