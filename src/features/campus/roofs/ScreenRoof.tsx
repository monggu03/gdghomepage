import { shade, type Point3 } from '@/lib/iso'
import { Box, Poly } from '../primitives'
import { FLOOR } from '../geometry'
import { ROOF_RISE, SCREEN } from './heights'
import type { RoofProps } from './types'
import s from '../campus.module.css'

/** 지붕 가장자리 턱 높이 */
const PARAPET = 0.1

/**
 * 평지붕 + 지붕 위 발표 화면 + 현관: 세션 · 공지가 열리는 강당.
 * 장소색은 지붕 · 화면 틀 · 현관 차양에만. 화면 안은 흰 슬라이드 (글자 줄은 회색).
 */
export function ScreenRoof({ fp, color, top, doorCenter }: RoofProps) {
  const { x, y, w, d } = fp
  const z0 = top + PARAPET
  const frameZ = z0 + SCREEN.legs
  const frameH = top + ROOF_RISE.screen - frameZ
  // 화면 앞면(+y) 위의 점: u = 왼쪽에서 거리, z = 높이
  const S = (u: number, z: number): Point3 => [x + SCREEN.dx + u, y + SCREEN.dy + SCREEN.d + 0.004, frameZ + z]
  const slide = (u0: number, u1: number, z: number, cls: string) => (
    <Poly key={`${u0}-${z}`} className={cls} pts={[S(u0, z), S(u1, z), S(u1, z + 0.075), S(u0, z + 0.075)]} />
  )
  return (
    <>
      {/* 턱 + 한 단 낮은 지붕 바닥 */}
      <Box x={x} y={y} w={w} d={d} z0={top} h={PARAPET} color={color} />
      <Poly pts={[[x + 0.16, y + 0.16, z0], [x + w - 0.16, y + 0.16, z0], [x + w - 0.16, y + d - 0.16, z0], [x + 0.16, y + d - 0.16, z0]]} fill={shade(color, 0.34)} />
      {/* 발표 화면: 다리 둘 + 장소색 틀 + 흰 화면 */}
      <Box x={x + SCREEN.dx + 0.3} y={y + SCREEN.dy} w={0.08} d={0.08} z0={z0} h={SCREEN.legs} color="#5c616c" />
      <Box x={x + SCREEN.dx + SCREEN.w - 0.38} y={y + SCREEN.dy} w={0.08} d={0.08} z0={z0} h={SCREEN.legs} color="#5c616c" />
      <Box x={x + SCREEN.dx} y={y + SCREEN.dy} w={SCREEN.w} d={SCREEN.d} z0={frameZ} h={frameH} color={color} />
      <Poly className={s.screen} pts={[S(0.09, 0.09), S(SCREEN.w - 0.09, 0.09), S(SCREEN.w - 0.09, frameH - 0.09), S(0.09, frameH - 0.09)]} />
      {slide(0.3, 1.25, frameH - 0.3, s.slideTitle)}
      {slide(0.3, 1.9, frameH - 0.55, s.slideLine)}
      {slide(0.3, 1.6, frameH - 0.75, s.slideLine)}
      {/* 현관 (문이 오른쪽 면에 있을 때): 기둥 둘 + 장소색 차양 */}
      {fp.door === 'R' && (
        <>
          {[-0.62, 0.54].map((o) => (
            <Box key={o} x={x + w + 0.44} y={doorCenter + o} w={0.08} d={0.08} z0={FLOOR} h={0.74} edge />
          ))}
          <Box x={x + w} y={doorCenter - 0.78} w={0.6} d={1.56} z0={FLOOR + 0.74} h={0.07} color={color} />
        </>
      )}
    </>
  )
}
