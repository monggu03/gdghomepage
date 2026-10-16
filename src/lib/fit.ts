/**
 * 장면을 화면의 '빈 자리'에 맞추는 계산.
 * 카드(HUD)가 덮지 않는 사각형(free) 안에 장면 경계(bbox)가 꽉 차도록 배율을 정하고,
 * 그 배율로 SVG viewBox 를 만든다. DOM 을 건드리지 않는 순수 함수라 테스트하기 쉽다.
 */

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface FitInput {
  /** 장면 내용의 경계 (SVG 좌표) */
  bbox: Rect
  /** SVG 요소의 화면 크기 (px) */
  frame: { w: number; h: number }
  /** 장면을 놓을 빈 자리 (SVG 요소 기준 px) */
  free: { x0: number; y0: number; x1: number; y1: number }
  maxScale?: number
}

export interface FitResult {
  viewBox: string
  scale: number
}

export function fitViewBox({ bbox, frame, free, maxScale = 1.7 }: FitInput): FitResult {
  const fw = Math.max(1, free.x1 - free.x0)
  const fh = Math.max(1, free.y1 - free.y0)
  const scale = Math.min(fw / bbox.w, fh / bbox.h, maxScale)
  const cx = (free.x0 + free.x1) / 2
  const cy = (free.y0 + free.y1) / 2
  const vx = bbox.x + bbox.w / 2 - cx / scale
  const vy = bbox.y + bbox.h / 2 - cy / scale
  const viewBox = [vx, vy, frame.w / scale, frame.h / scale].map((n) => n.toFixed(1)).join(' ')
  return { viewBox, scale }
}

/** 장면이 작게 그려질수록 이름표 핀을 키운다 (최대 1.75배) */
export const pinScaleFor = (sceneScale: number) => Math.min(1.75, Math.max(1, 1.02 / sceneScale))
