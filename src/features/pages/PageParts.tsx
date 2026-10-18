import { useId, type CSSProperties, type ReactNode } from 'react'
import s from './pages.module.css'

/**
 * 하위 페이지 공통 조각 (docs/DESIGN.md 5장).
 * 섹션은 두 가지다.
 * - 이야기 섹션: 이름표 → 주장 제목(48) → 한 줄 → 12칸 내용. 면(흰 · 옅은 회색 · 먹색)으로 나눈다 → common/StorySection
 * - 참고 섹션(여기 Section): FAQ · 일정 목록 · 지원 과정 · 기록. 1px 괘선 + 28px 제목, 섹션 사이 96
 * 페이지는 머리말 · 꼬리말 없이 본문만 그리고(AppLayout 이 감싼다), 맨 끝에 common/JoinStrip 을 직접 넣는다 (/recruits 제외).
 */

/** 장소 표식: 8px 네모 */
export function Mark({ color }: { color: string }) {
  return <span className="mark" style={{ '--c': color } as CSSProperties} aria-hidden="true" />
}

/**
 * 페이지 머리 (건물 장면이 없는 페이지: 오류 · 찾을 수 없음 · 관리자): 장소 표식 + 부제 / h1 / 리드 / 기준 줄.
 * 건물이 있는 장소 페이지는 placehero/PlaceHero 를 쓴다.
 * wide: 제목이 긴 페이지(오류 등)는 제목을 넓게 쓰고 리드를 그 아래에 둔다.
 */
export function PageHead({
  mark,
  eyebrow,
  title,
  lead,
  meta,
  wide = false,
}: {
  mark?: string
  eyebrow: ReactNode
  title: ReactNode
  lead?: ReactNode
  meta?: ReactNode
  wide?: boolean
}) {
  return (
    <header className={`${s.head} ${wide ? s.headWide : ''}`}>
      <p className={s.eyebrow}>
        {mark && <Mark color={mark} />}
        {eyebrow}
      </p>
      <h1 className={s.title}>{title}</h1>
      {lead && <p className={s.lead}>{lead}</p>}
      {meta && <p className={s.meta}>{meta}</p>}
    </header>
  )
}

/**
 * 참고 섹션: 1px 괘선 + 제목(28) + 한 줄 설명, 섹션 사이 96 (폰 64).
 * head: top(기본) = 머리를 위에, 내용은 12칸 전체 (일정 줄 · 단계 그림처럼 넓은 내용)
 *       side = 머리는 왼쪽 3칸, 내용은 4–12칸 (FAQ · 짧은 목록). 1023 이하에서는 위아래로 쌓는다
 * aside: 머리 오른쪽 끝(side 면 설명 아래)에 붙는 짧은 것 (거르기 · 작은 숫자).
 * quiet: 마지막 짧은 안내처럼 덜 중요한 섹션 (제목 한 단계 작게).
 * 이야기 섹션(주장 제목 48 · 면)은 common/StorySection 을 쓴다.
 */
export function Section({
  id,
  title,
  desc,
  aside,
  head = 'top',
  quiet = false,
  children,
}: {
  id: string
  title: ReactNode
  desc?: ReactNode
  aside?: ReactNode
  head?: 'top' | 'side'
  /** 마지막 짧은 안내처럼 덜 중요한 섹션 */
  quiet?: boolean
  children: ReactNode
}) {
  const titleId = `${id}-title`
  return (
    <section id={id} className={`${s.section} ${head === 'side' ? s.sectionSide : ''} ${quiet ? s.sectionQuiet : ''}`} aria-labelledby={titleId}>
      <div className={s.sectionHead}>
        <div className={s.sectionTitle}>
          <h2 id={titleId}>{title}</h2>
          {desc && <p>{desc}</p>}
        </div>
        {aside && <div className={s.sectionAside}>{aside}</div>}
      </div>
      <div className={s.sectionBody}>{children}</div>
    </section>
  )
}

/**
 * 사이트 밖으로 나가는 링크: 새 탭, rel=noreferrer, 끝에 ↗.
 * context 는 화면 읽기 프로그램에만 읽힌다 ('자세히' 가 여러 개일 때 무엇의 자세히인지).
 */
export function ExternalLink({ href, children, context, className = 'link' }: { href: string; children: ReactNode; context?: string; className?: string }) {
  return (
    <a className={`${className} ${s.ext}`} href={href} target="_blank" rel="noreferrer">
      <span className={s.extText}>{children}</span>
      <span className="visually-hidden">
        {context ? `: ${context}` : ''} (새 창)
      </span>
      <span className={s.arrow} aria-hidden="true">
        ↗
      </span>
    </a>
  )
}

/** 불러오는 중 · 실패 · 비어 있음 한 줄 */
export function StateLine({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return (
    <p className={s.state} role="status">
      {children}
      {onRetry && (
        <>
          {' '}
          <button type="button" className="link" onClick={onRetry}>
            다시 시도
          </button>
        </>
      )}
    </p>
  )
}

export interface ToggleOption<T extends string> {
  id: T
  label: ReactNode
  /** 화면 읽기 프로그램용 이름 (label 이 숫자만 있을 때 등) */
  count?: number
}

/**
 * 거르기 버튼 묶음 (기수 · 종류 · 연도 모두 같은 모양). 누른 상태는 aria-pressed 로 알린다.
 * 붙어 있는 칸 하나짜리 조작부이고, 칸마다 높이 44 이상. 폰에서 넘치면 가로로 밀어 본다.
 */
export function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly ToggleOption<T>[]
  value: T
  onChange: (v: T) => void
}) {
  const labelId = useId()
  return (
    <div className={s.filterRow}>
      <span className={s.filterLabel} id={labelId}>
        {label}
      </span>
      <div className={s.scroller}>
        <div role="group" aria-labelledby={labelId} className={s.segmented}>
          {options.map((o) => (
            <button key={o.id} type="button" aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
              {o.label}
              {o.count !== undefined && (
                <span className={`${s.count} num`}>
                  <span className="visually-hidden"> </span>
                  {o.count}
                  <span className="visually-hidden">건</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
