import type { RoofType } from '@/domain/types'

/** 지붕이 벽 위로 솟는 높이 (격자 단위). 이름표 핀 높이 계산과 지붕 그리기가 같이 쓴다 */
export const ROOF_RISE: Record<RoofType, number> = {
  screen: 1.3,
  saw: 0.7,
  arch: 0.95,
  gable: 0.9,
}
