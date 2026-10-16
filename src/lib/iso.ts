/**
 * 아이소메트릭(위에서 비스듬히 본) 투영.
 * 격자 좌표 (x, y, 높이 z) → 화면 좌표 (px, py).
 * x가 커지면 화면 오른쪽 아래, y가 커지면 왼쪽 아래, z가 커지면 위로 간다.
 */

export const TILE_W = 64
export const TILE_H = 32

export type Point3 = readonly [number, number, number?]

export function iso(x: number, y: number, z = 0): [number, number] {
  return [((x - y) * TILE_W) / 2, ((x + y) * TILE_H) / 2 - z * TILE_H]
}

/** SVG polygon 의 points 문자열 */
export function points(list: readonly Point3[]): string {
  return list
    .map(([x, y, z = 0]) => {
      const [px, py] = iso(x, y, z)
      return `${px.toFixed(1)},${py.toFixed(1)}`
    })
    .join(' ')
}

/** 색을 밝게(+) 또는 어둡게(-). amt 는 -1 ~ 1 */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const rgb = [n >> 16, (n >> 8) & 255, n & 255]
  return (
    '#' +
    rgb
      .map((v) => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
      .join('')
  )
}

/**
 * 앞뒤 정렬 키. 값이 큰 물체가 화면 앞(아래)에 있으므로 나중에 그린다.
 * 상자는 앞쪽 모서리(x+w, y+d), 점 물체는 그 자리(x+y)를 쓴다.
 */
export const depthOfBox = (x: number, y: number, w: number, d: number) => x + w + y + d
export const depthOfPoint = (x: number, y: number) => x + y
