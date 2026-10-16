import { shade, type Point3 } from '@/lib/iso'
import { Box, Poly } from '../primitives'
import type { RoofProps } from './types'

/** 평지붕 + 지붕 위 발표 화면 + 현관 기둥: 세션·공지가 열리는 강당 */
export function ScreenRoof({ fp, color, top, doorCenter }: RoofProps) {
  const { x, y, w, d } = fp
  const S = (u: number, z: number): Point3 => [x + 0.55 + u, y + 1.071, top + z]
  const bars: Array<[string, number, number]> = [
    ['#4285F4', 1.6, 0.76],
    ['#EA4335', 1.15, 0.56],
    ['#FBBC04', 0.75, 0.36],
  ]
  return (
    <>
      <Poly
        pts={[[x + 0.16, y + 0.16, top + 0.001], [x + w - 0.16, y + 0.16, top + 0.001], [x + w - 0.16, y + d - 0.16, top + 0.001], [x + 0.16, y + d - 0.16, top + 0.001]]}
        fill={shade(color, 0.32)}
      />
      {/* 발표 화면 */}
      <Box x={x + 0.55} y={y + 0.95} w={2.3} d={0.12} z0={top} h={1.3} color="#3A4258" />
      <Poly pts={[S(0.1, 0.12), S(2.2, 0.12), S(2.2, 1.2), S(0.1, 1.2)]} fill="#FFFFFF" />
      <Poly pts={[S(0.3, 1.02), S(1.2, 1.02), S(1.2, 0.93), S(0.3, 0.93)]} fill="#C9CFDD" />
      {bars.map(([c, len, z]) => (
        <Poly key={c} pts={[S(0.3, z), S(0.3 + len, z), S(0.3 + len, z - 0.12), S(0.3, z - 0.12)]} fill={c} />
      ))}
      {/* 현관 기둥과 처마 (문이 오른쪽 면에 있을 때) */}
      {fp.door === 'R' && (
        <>
          {[-0.66, -0.22, 0.22, 0.66].map((o) => (
            <Box key={o} x={x + w + 0.42} y={doorCenter + o - 0.045} w={0.09} d={0.09} z0={0.12} h={0.8} color="#FFFFFF" />
          ))}
          <Box x={x + w} y={doorCenter - 0.85} w={0.58} d={1.7} z0={0.92} h={0.1} color="#EEF1F7" />
        </>
      )}
    </>
  )
}

