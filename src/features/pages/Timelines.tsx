import type { CSSProperties, ReactNode } from 'react'
import { layoutSpans, type Span, type StepState } from './timeline'
import s from './pages.module.css'

export interface RailStep {
  id: string
  label: string
  /** '10.27' · '11월' */
  when: string
  dateTime?: string
  state: StepState
  /** 다음 단계 옆에 붙는 짧은 말 ('D-10') */
  note?: ReactNode
}

const STATE_TEXT: Record<StepState, string> = { done: '지남', next: '다음 단계', later: '' }

/**
 * 순서만 있는 단계 줄 (G-Sprint). 지난 단계까지는 진한 선, 다음 단계는 장소색 표식.
 * 폰에서는 세로로 선다.
 */
export function StepRail({ steps, color, label }: { steps: readonly RailStep[]; color: string; label: string }) {
  return (
    <ol className={s.rail} aria-label={label} style={{ '--n': steps.length, '--c': color } as CSSProperties}>
      {steps.map((st) => (
        <li key={st.id} className={s.railStep} data-state={st.state} aria-current={st.state === 'next' ? 'step' : undefined}>
          <span className={s.railMark} aria-hidden="true" />
          <span className={s.railLabel}>{st.label}</span>
          <span className={`${s.railWhen} num`}>{st.dateTime ? <time dateTime={st.dateTime}>{st.when}</time> : st.when}</span>
          {st.note && <span className={s.railNote}>{st.note}</span>}
          {STATE_TEXT[st.state] && <span className="visually-hidden"> ({STATE_TEXT[st.state]})</span>}
        </li>
      ))}
    </ol>
  )
}

/**
 * 기간을 날 수에 비례해 한 줄에 그린 그림 (지난 모집). 글로 된 목록이 같은 내용을 담으므로 그림은 읽히지 않게 둔다.
 * 달이 바뀌는 곳에 '9월' 눈금. 날짜가 겹치는 기간은 위 줄로 올린다.
 */
export function SpanStrip({ spans, labels, ends }: { spans: readonly Span[]; labels: Record<string, string>; ends: [string, string] }) {
  const { boxes, months, lanes } = layoutSpans(spans)
  if (boxes.length === 0) return null
  return (
    <div className={s.strip} aria-hidden="true">
      <div className={s.stripTrack} style={{ '--lanes': lanes } as CSSProperties}>
        <span className={`${s.stripEnd} num`}>{ends[0]}</span>
        <span className={`${s.stripEnd} ${s.stripEndR} num`}>{ends[1]}</span>
        {months.map((m) => (
          <span key={m.label} className={s.stripMonth} style={{ left: `${m.left}%` }}>
            <span className="num">{m.label}</span>
          </span>
        ))}
        {boxes.map((b, i) => (
          <span
            key={b.id}
            className={s.stripBox}
            data-point={spans[i].end ? undefined : ''}
            style={{ left: `${b.left}%`, width: `${b.width}%`, '--lane': b.lane } as CSSProperties}
          >
            <span className={s.stripLabel}>{labels[b.id]}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
