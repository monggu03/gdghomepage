import type { JSX } from 'react'
import type { Footprint } from '@/domain/types'

export interface RoofProps {
  fp: Footprint
  color: string
  /** 벽 꼭대기 높이 */
  top: number
  /** 문 가운데 위치 (문 있는 면을 따라) */
  doorCenter: number
}

/**
 * 지붕 하나 = 그리는 컴포넌트 + 지붕이 솟는 높이(이름표 위치 계산용).
 * 새 지붕은 이 모양으로 만들어 roofs/index.ts 에 등록만 하면 된다 (Strategy + Registry).
 */
export interface RoofSpec {
  height: number
  Component: (props: RoofProps) => JSX.Element
}

/** 지붕 컴포넌트 안에서 쓰는 유리 그라데이션 id (CampusScene 의 defs) */
export const GLASS_L = 'url(#campus-glass-l)'
export const GLASS_R = 'url(#campus-glass-r)'
