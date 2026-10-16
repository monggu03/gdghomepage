import type { RoofType } from '@/domain/types'
import { ArchRoof } from './ArchRoof'
import { GableRoof } from './GableRoof'
import { ROOF_RISE } from './heights'
import { SawtoothRoof } from './SawtoothRoof'
import { ScreenRoof } from './ScreenRoof'
import type { RoofSpec } from './types'

/**
 * 지붕 등록부. Building 은 if/switch 없이 여기서 꺼내 쓴다 (Strategy + Registry).
 * Record<RoofType, …> 이라서 RoofType 에 새 값을 넣고 등록을 빼먹으면 타입 오류가 난다.
 */
export const ROOFS: Record<RoofType, RoofSpec> = {
  screen: { height: ROOF_RISE.screen, Component: ScreenRoof },
  saw: { height: ROOF_RISE.saw, Component: SawtoothRoof },
  arch: { height: ROOF_RISE.arch, Component: ArchRoof },
  gable: { height: ROOF_RISE.gable, Component: GableRoof },
}
