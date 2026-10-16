/** 첫 화면이 머리말 아래쪽 위치를 재려고 찾는 표시. 머리말과 첫 화면이 같은 이름을 쓰게 한 곳에 둔다 */
export const HEADER_ATTR = 'data-site-header'

/** 머리말 카드(둥근 띠)의 화면 위치 */
export function headerRect(): DOMRect | undefined {
  return document.querySelector(`[${HEADER_ATTR}] > div`)?.getBoundingClientRect()
}
