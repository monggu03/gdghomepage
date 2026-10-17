import type { ReactNode } from 'react'
import s from './sections.module.css'

interface Props {
  id: string
  title: string
  /** 제목 아래 한 줄 (~습니다체, 채움말 없이) */
  line?: ReactNode
  /** 제목 위에 얹을 것 (지금은 쓰는 곳 없음) */
  above?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * 홈 섹션 틀: 위 1px 괘선, 12칸 격자에서 제목은 왼쪽 3칸, 내용은 4–12칸 (폰 · 태블릿은 위아래로).
 * 상자로 감싸지 않는다 (DESIGN 4장).
 */
export function Section({ id, title, line, above, children, className = '' }: Props) {
  const titleId = `${id}-title`
  return (
    <section id={id} className={`${s.section} ${className}`} aria-labelledby={titleId}>
      <div className={`container ${s.grid}`}>
        <div className={s.head}>
          {above}
          <h2 id={titleId} className={s.h2}>
            {title}
          </h2>
          {line && <p className={s.line}>{line}</p>}
        </div>
        <div className={s.body}>{children}</div>
      </div>
    </section>
  )
}
