import type { ReactNode } from 'react'
import { depthOfPoint } from '@/lib/iso'
import { Bench, Tree } from './Greenery'
import { BENCHES, TREES } from './layout'

export interface SceneItem {
  key: string
  /** 앞뒤 순서 키 (lib/iso depthOf*). 큰 값이 앞 */
  depth: number
  node: ReactNode
}

/** 나무 · 벤치 (홈 지도와 같은 자리). 한 번 만들어 두고 건물과 섞어 앞뒤로 정렬한다 */
export function sceneryItems(): SceneItem[] {
  return [
    ...TREES.map(([x, y, size, kind], i) => ({ key: `tree-${i}`, depth: depthOfPoint(x, y) + 0.05, node: <Tree x={x} y={y} size={size} kind={kind} /> })),
    ...BENCHES.map(([x, y, dir], i) => ({ key: `bench-${i}`, depth: depthOfPoint(x, y) + 0.9, node: <Bench x={x} y={y} dir={dir} /> })),
  ]
}
