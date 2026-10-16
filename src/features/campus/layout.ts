/**
 * 지도 바닥과 소품의 배치 (격자 좌표).
 * 건물 자리는 config/places.ts 에 있고, 여기는 건물이 아닌 것만 둔다.
 */

/** 바닥 한 변 칸 수 */
export const GRID = 14

/** 잔디 네 칸 [x0, y0, x1, y1] */
export const GRASS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.4, 0.4, 6.1, 6.1],
  [7.9, 0.4, 13.6, 6.1],
  [0.4, 7.9, 6.1, 13.6],
  [7.9, 7.9, 13.6, 13.6],
]

/** 십자 보행로 폭 */
export const WALK_BAND = [6.2, 7.8] as const

/** 가운데 광장 [x0, y0, x1, y1]과 깃발 자리 */
export const PLAZA = [5, 5, 9, 9] as const
export const FLAG_AT = [7, 7] as const

/** 나무는 보행로 입구 양옆에만 [x, y, 크기] */
export const TREES: ReadonlyArray<readonly [number, number, number]> = [
  [5.5, 0.9, 1],
  [8.5, 0.9, 0.9],
  [0.9, 5.5, 0.9],
  [13.1, 5.5, 1],
  [0.9, 8.5, 1],
  [13.1, 8.5, 0.9],
  [5.5, 13.1, 0.9],
]

/** 덤불은 광장 네 모서리에만 */
export const BUSHES: ReadonlyArray<readonly [number, number]> = [
  [5.45, 5.45],
  [8.55, 5.45],
  [5.45, 8.55],
  [8.55, 8.55],
]

export const BENCHES: ReadonlyArray<readonly [number, number]> = [
  [7.95, 5.3],
  [5.3, 8.3],
]

/**
 * 장면이 차지하는 경계 (SVG 좌표). 바닥 마름모(가로 ±448, 세로 0~467)에
 * 건물과 이름표가 위로 솟는 만큼을 더했다. DOM 을 재지 않아도 되도록 계산값으로 둔다.
 */
export const SCENE_BOUNDS = { x: -468, y: -130, w: 936, h: 607 } as const

/** 폰에서는 양 끝 나무 모서리를 조금 잘라 장면을 키운다 */
export const SCENE_BOUNDS_NARROW = { x: -438, y: -130, w: 876, h: 607 } as const

/**
 * 화면 오른쪽에 있는 장소인지 가르는 기준 (격자 x - y).
 * 이 값보다 크면 지도 오른쪽 끝(Projects 쪽)이라 이름표를 왼쪽으로 돌릴 수 있다.
 */
export const RIGHT_SIDE_THRESHOLD = 3.5
