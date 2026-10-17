import { Link } from 'react-router-dom'
import { placeColor } from '@/config/places'
import { SITE } from '@/config/site'
import { FAQS, RECRUITING } from '@/content'
import { useToday } from '@/hooks/useToday'
import { pastRecruitLine, sentences, spanLabel } from './homeData'
import { Section } from './Section'
import s from './sections.module.css'

const FAQ_SHOWN = 3

/**
 * 모집: 제목이 지금 상태('5기 모집 일정 미정'), 아래 세 줄(상태 · 지난 모집 시기 · 먼저 공지할 채널),
 * 주 버튼 하나(인스타그램), 지난 모집 과정, 자주 묻는 질문 3개.
 * 모집 중일 때는 운영진이 recruiting.json 에 쓴 안내(message)를 그대로 보인다.
 */
export function JoinSection() {
  const today = useToday()
  const { current, history } = RECRUITING
  const last = [...history].sort((a, b) => b.generation - a.generation)[0]
  const steps = last ? last.steps.map((st) => ({ ...st, end: 'end' in st ? st.end : undefined })) : []
  const faqs = FAQS.slice(0, FAQ_SHOWN)
  const open = current.status === 'open'
  const title = open ? `${current.generation}기 모집 중` : `${current.generation}기 모집 일정 미정`
  const lines = open
    ? sentences(current.message)
    : [
        '지금은 모집 기간이 아닙니다.',
        last ? pastRecruitLine(last.generation, steps) : null,
        `${current.generation}기 일정이 정해지면 이 페이지와 인스타그램 ${SITE.links.instagramHandle}에 가장 먼저 공지합니다.`,
      ].filter((line): line is string => Boolean(line))

  return (
    <Section id="join" title={title}>
      <div className={s.join}>
        <div className={s.joinMain}>
          <p className={s.joinMsg}>
            {lines.map((line) => (
              <span key={line} className={s.sentence}>
                {line}{' '}
              </span>
            ))}
          </p>
          <a className="btn-primary" href={current.channel} target="_blank" rel="noreferrer">
            인스타그램에서 소식 받기 ↗
          </a>
        </div>
        {last && last.steps.length > 0 && (
          <div className={s.rail}>
            <h3 className={s.railTitle}>{last.generation}기 모집 과정</h3>
            <ol>
              {steps.map((st) => (
                <li key={st.id}>
                  <i className="mark" style={{ ['--c' as string]: placeColor('recruits') }} aria-hidden="true" />
                  <span className={`num ${s.railWhen}`}>{spanLabel(st.start, st.end, today)}</span>
                  <span className={s.railWhat}>{st.label}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      {faqs.length > 0 && (
        <div className={s.faq}>
          <h3 className={s.faqTitle}>자주 묻는 질문</h3>
          <div className={s.faqList}>
            {faqs.map((f) => (
              <details key={f.id} className={s.faqItem}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className={s.more}>
            <Link className="link" to="/recruits#faq">
              자주 묻는 질문 더 보기
            </Link>
          </p>
        </div>
      )}
    </Section>
  )
}
