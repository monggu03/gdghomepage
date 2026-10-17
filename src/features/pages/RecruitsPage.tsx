import { PLACE_BY_ID, placeColor } from '@/config/places'
import { SITE } from '@/config/site'
import { CHAPTER, FAQS, RECRUITING } from '@/content'
import { useToday } from '@/hooks/useToday'
import { dateLabel, hostOf, isUrl, spanDays } from './format'
import { ExternalLink, PageHead, Section, StateLine } from './PageParts'
import { SpanStrip } from './Timelines'
import s from './pages.module.css'
import r from './recruits.module.css'

const RECRUIT_COLOR = placeColor('recruits')

interface Step {
  id: string
  label: string
  start: string
  end?: string
  /** '면접 2026.09.11 · 최종 발표 2026.09.12' 같은 덧붙임 */
  note?: string
  source?: string
}

/** 출처 한 줄: 주소면 도메인 링크, 글이면 그대로 */
function Source({ source, context }: { source?: string; context: string }) {
  if (!source) return null
  return (
    <span className={r.source}>
      출처{' '}
      {isUrl(source) ? (
        <ExternalLink href={source} context={context} className={s.inlineLink}>
          {hostOf(source)}
        </ExternalLink>
      ) : (
        source
      )}
    </span>
  )
}

/** 지난 모집 한 기수: 날 수에 비례한 줄 그림 + 단계 목록(이름 · 날짜 · 날 수 · 출처) */
function History({ steps, today }: { steps: readonly Step[]; today: string }) {
  const labels = Object.fromEntries(steps.map((st) => [st.id, st.label]))
  const first = steps.map((st) => st.start).sort()[0]
  const last = steps.map((st) => st.end ?? st.start).sort().at(-1) ?? first
  return (
    <>
      <SpanStrip
        spans={steps.map((st) => ({ id: st.id, start: st.start, end: st.end && st.end !== st.start ? st.end : undefined }))}
        labels={labels}
        ends={[dateLabel(first, null, today), dateLabel(last, null, today)]}
      />
      <ol className={r.steps}>
        {steps.map((st) => {
          const end = st.end && st.end !== st.start ? st.end : null
          return (
            <li key={st.id} className={r.step}>
              <p className={r.stepLabel}>{st.label}</p>
              <p className={`${r.stepWhen} num`}>
                <time dateTime={st.start}>{dateLabel(st.start, end, today)}</time>
                {end && <span className={r.days}>{spanDays(st.start, end)}일</span>}
              </p>
              {st.note && <p className={r.stepNote}>{st.note}</p>}
              <p className={r.stepSource}>
                <Source source={st.source} context={st.label} />
              </p>
            </li>
          )
        })}
      </ol>
    </>
  )
}

/** 지원 안내: 지금 상태 → 지난 모집 → 자주 묻는 질문 → 연락 */
export function RecruitsPage() {
  const today = useToday()
  const current = RECRUITING.current
  const history = [...RECRUITING.history].sort((a, b) => b.generation - a.generation)
  const latest = history[0]
  const statusTitle = current.status === 'open' ? `${current.generation}기 모집 중` : `${current.generation}기 모집 일정 미정`

  return (
    <div className={`container ${s.page}`}>
      <PageHead
        mark={RECRUIT_COLOR}
        eyebrow={PLACE_BY_ID.recruits.sub}
        title="지원 안내"
        lead="GDGoC DGU는 기수마다 새 멤버를 모집합니다. 지금 상태와 지난 모집 기록, 자주 묻는 질문을 한곳에 모았습니다."
        meta={
          <>
            모집 기록은 인스타그램 모집 게시물 기준 · <span className="num">{dateLabel(RECRUITING.updatedAt, null, today)}</span> 갱신
          </>
        }
      />

      <Section id="status" title={statusTitle} desc="모집이 열리면 이 자리에 기간과 지원 방법을 올립니다.">
        <div className={r.status}>
          <p className={r.message}>{current.message}</p>
          <a className="btn-primary" href={current.channel} target="_blank" rel="noreferrer">
            인스타그램에서 소식 받기
            <span className="visually-hidden"> (새 창)</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </Section>

      {latest && latest.steps.length > 0 && (
        <Section
          id="history"
          title={`${latest.generation}기는 이렇게 모집했습니다`}
          desc={`${current.generation}기 일정이 아닙니다. 다음 모집 시기를 가늠할 수 있도록 남긴 기록입니다.`}
        >
          <History steps={latest.steps} today={today} />
        </Section>
      )}

      <Section id="faq" title="자주 묻는 질문" desc="공개된 출처가 있는 답만 싣습니다.">
        {FAQS.length === 0 ? (
          <StateLine>답과 출처를 함께 정리하고 있습니다. 그동안 궁금한 점은 아래 연락처로 물어봐 주세요.</StateLine>
        ) : (
          <ul className={r.faq}>
            {FAQS.map((f) => (
              <li key={f.id}>
                <details className={r.qa} id={`faq-${f.id}`}>
                  <summary>
                    <span className={r.q}>{f.q}</span>
                    <span className={r.sign} aria-hidden="true" />
                  </summary>
                  <div className={r.a}>
                    <p>{f.a}</p>
                    {f.source && (
                      <p className={r.aSource}>
                        <Source source={f.source} context={f.q} />
                      </p>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="contact" title="연락" desc="지원 전에 궁금한 점, 다른 학교 챕터나 연사 · 협업 제안 모두 아래로 보내 주세요.">
        <dl className={r.contact}>
          <div>
            <dt>이메일</dt>
            <dd>
              <span className={r.email}>{CHAPTER.email}</span>
              <a className="link" href={`mailto:${CHAPTER.email}`}>
                메일 쓰기
              </a>
            </dd>
          </div>
          <div>
            <dt>인스타그램</dt>
            <dd>
              <ExternalLink href={SITE.links.instagram}>{SITE.links.instagramHandle}</ExternalLink>
              <span className={r.contactNote}>모집 · 행사 공지</span>
            </dd>
          </div>
          <div>
            <dt>챕터 페이지</dt>
            <dd>
              <ExternalLink href={CHAPTER.chapterPage}>{hostOf(CHAPTER.chapterPage)}</ExternalLink>
              <span className={r.contactNote}>행사 등록 · 지난 행사</span>
            </dd>
          </div>
        </dl>
      </Section>
    </div>
  )
}
