import { useId, type CSSProperties, type ReactNode } from 'react'
import s from './pages.module.css'

/**
 * 하위 페이지 공통 조각 (docs/DESIGN.md 5장: 12칸, 섹션 머리 1–3칸 · 내용 4–12칸).
 * 페이지는 머리말 · 꼬리말 없이 본문만 그린다 (AppLayout 이 감싼다).
 */

/** 장소 표식: 8px 네모 */
export function Mark({ color }: { color: string }) {
  return <span className="mark" style={{ '--c': color } as CSSProperties} aria-hidden="true" />
}

/**
 * 페이지 머리: 장소 표식 + 부제 / h1 / 리드 / 기준 줄.
 * 넓은 화면에서는 h1 과 리드를 같은 기준선에 놓아, 리드가 아래 섹션 내용과 같은 칸(4칸)에서 시작한다.
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

/** 섹션: 왼쪽 3칸에 제목 + 한 줄, 오른쪽 9칸에 내용. 폰 · 태블릿은 위아래로 쌓는다 */
export function Section({
  id,
  title,
  desc,
  sticky = false,
  quiet = false,
  children,
}: {
  id: string
  title: ReactNode
  desc?: ReactNode
  /** 긴 목록 옆에서 섹션 제목을 붙여 둔다 (넓은 화면만) */
  sticky?: boolean
  /** 마지막 짧은 안내처럼 덜 중요한 섹션 */
  quiet?: boolean
  children: ReactNode
}) {
  const titleId = `${id}-title`
  return (
    <section id={id} className={`${s.section} ${quiet ? s.sectionQuiet : ''}`} aria-labelledby={titleId}>
      <div className={`${s.sectionHead} ${sticky ? s.sticky : ''}`}>
        <h2 id={titleId}>{title}</h2>
        {desc && <p>{desc}</p>}
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
