import type { Footprint } from '@/domain/types'
import type { Point3 } from '@/lib/iso'
import { FLAG_AT } from './layout'
import { ROOFS } from './roofs'

/** 건물 받침대 높이. 벽은 이 위에서 시작한다 */
export const FLOOR = 0.12

/** 지붕 꼭대기 위 이름표 핀 자리 (격자 좌표) */
export function pinAnchor(fp: Footprint): Point3 {
  return [fp.x + fp.w / 2, fp.y + fp.d / 2, FLOOR + fp.h + ROOFS[fp.roof].height + fp.pinGap]
}

/** 깃발 꼭대기 위 이름표 자리 */
export const FLAG_PIN: Point3 = [FLAG_AT[0], FLAG_AT[1], 2.75]
