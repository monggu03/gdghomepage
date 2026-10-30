/**
 * 작품 → 자세히 보기 창 '이어지는 열림' (View Transitions 같은 문서 전환, 의존성 없음).
 * '무엇이 어디서 열렸는지'를 보여 준다: 누른 작품의 그림(대표 작품 무대) 또는 작품 상자(줄 목록)가 창의 그 자리로 옮겨 가며 커진다.
 * 닫을 때는 거꾸로 제자리로 돌아간다. 페이지 이동의 좌우 밀기(app/viewTransitions.ts)와 같은 API · 같은 속도 단계(320ms 열림 · 닫힘은 더 빠르게).
 *
 * 켜지는 조건: 브라우저가 startViewTransition 을 지원 · '동작 줄이기'가 아님 · 넓은 화면(768↑, 폰은 아래에서 올라오는 시트 그대로).
 * 조건이 안 맞으면 false 를 돌려주고, 부른 쪽이 원래대로 연다 · 닫는다.
 *
 * 이름(view-transition-name)은 찍는 순간에만 붙였다가 바로 뗀다: 같은 이름이 화면에 둘이면 전환이 취소되기 때문.
 *  - 'sheet-media': 대표 작품 무대([data-morph-media]) ↔ 창의 첫 그림 틀([data-morph-target='media']). 이때 창 판은 'sheet-panel' 로 따로 나타남 · 사라짐
 *  - 'sheet-box'  : 줄 목록 작품 상자([data-morph='box']) ↔ 창(dialog)
 * 움직임 모양은 styles/global.css 의 html[data-vt^='sheet'] 규칙이 그린다.
 */

type Kind = 'media' | 'box'
type Part = readonly [el: HTMLElement, name: string]

export function canMorph(): boolean {
  if (typeof document === 'undefined' || typeof document.startViewTransition !== 'function') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return window.matchMedia('(min-width: 768px)').matches
}

function name(parts: readonly Part[], on: boolean) {
  for (const [el, n] of parts) el.style.viewTransitionName = on ? n : ''
}

/** 작품 쪽 이름 붙일 곳 (카드: [data-morph]). mediaOk=false 면(창에 첫 그림이 없음) 상자끼리 잇는다 */
function cardParts(card: HTMLElement, mediaOk = true): { kind: Kind; parts: Part[] } {
  const media = card.querySelector<HTMLElement>('[data-morph-media]')
  if (mediaOk && card.dataset.morph === 'media' && media) return { kind: 'media', parts: [[media, 'sheet-media']] }
  return { kind: 'box', parts: [[card, 'sheet-box']] }
}

/** 창 쪽 이름 붙일 곳 */
function sheetParts(dialog: HTMLDialogElement, kind: Kind): Part[] {
  if (kind === 'media') {
    const frame = dialog.querySelector<HTMLElement>("[data-morph-target='media']")
    // 창에 첫 그림이 없으면 상자끼리 잇는다 (이름이 한쪽에만 있으면 그냥 나타남 · 사라짐이 된다)
    // 창 판(sheet-panel)은 따로 찍어 빨리 나타나게 한다: 페이지 위로 반투명 창 글자가 겹쳐 보이는 시간을 줄인다
    if (frame) return [[dialog, 'sheet-panel'], [frame, 'sheet-media']]
  }
  return [[dialog, 'sheet-box']]
}

function inView(el: Element) {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0
}

function run(kind: 'sheet-open' | 'sheet-close', update: () => Promise<void> | void, cleanup: () => void) {
  const root = document.documentElement
  root.dataset.vt = kind
  const t = document.startViewTransition(update)
  t.finished.finally(() => {
    cleanup()
    if (root.dataset.vt === kind) delete root.dataset.vt
  })
}

/**
 * 작품을 눌러 창을 열 때. open() 은 주소를 ?p=<id> 로 바꾸는 navigate(..., { flushSync: true }):
 * 상태가 동기로 그려지고 그 안의 showModal(useModalDialog 의 effect)도 같은 틱에 끝나야 새 화면을 찍을 수 있다.
 */
export function morphOpen(card: HTMLElement | null, open: () => Promise<void> | void): boolean {
  if (!card || !canMorph()) return false
  const { kind, parts } = cardParts(card)
  let after: Part[] = []
  name(parts, true)
  run(
    'sheet-open',
    async () => {
      name(parts, false)
      await open()
      const dialog = document.querySelector<HTMLDialogElement>('dialog[data-project-sheet][open]')
      if (!dialog) return
      after = sheetParts(dialog, kind)
      name(after, true)
    },
    () => name(after, false),
  )
  return true
}

/** 닫기 버튼 · 바깥 누름 · Esc 로 닫을 때. 연 작품이 화면에 보일 때만 제자리로 돌아간다 (아니면 false → 그냥 닫기) */
export function morphClose(dialog: HTMLDialogElement, projectId: string, close: () => void): boolean {
  if (!canMorph()) return false
  const link = document.querySelector(`[data-sheet-card="${CSS.escape(projectId)}"]`)
  const card = link?.closest<HTMLElement>('[data-morph]')
  if (!card || !inView(card)) return false
  const { kind, parts } = cardParts(card, dialog.querySelector("[data-morph-target='media']") !== null)
  const before = sheetParts(dialog, kind)
  name(before, true)
  run(
    'sheet-close',
    () => {
      name(before, false)
      close()
      name(parts, true)
    },
    () => name(parts, false),
  )
  return true
}
