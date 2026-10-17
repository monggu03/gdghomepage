import { CHAPTER, GENERATIONS } from '@/content'
import { useProjects, useSchedule } from '@/data/queries'
import { useToday } from '@/hooks/useToday'
import { dotMonth, generationPeriod, pastPublishedCount, sortGenerations } from './homeData'
import { publicRepoCount } from './publicProjects'
import { Section } from './Section'
import s from './sections.module.css'

interface Fact {
  id: string
  label: string
  value: number
  unit: string
}

/**
 * 연혁 아래 한 줄: '그룹 멤버 244명 · 지난 행사 45건 · 공개 프로젝트 25개 · 2026.10 기준'.
 * 모두 콘텐츠에서 세고(멤버는 gdg.community.dev, 행사는 gdg.community.dev 에 올라간 것, 프로젝트는 GitHub 조직 저장소), 0 이면 뺀다.
 */
function useFacts(): Fact[] {
  const today = useToday()
  const { data: events } = useSchedule()
  const { data: projects } = useProjects()
  const list: Fact[] = []
  if (CHAPTER.members?.value) list.push({ id: 'members', label: '그룹 멤버', value: CHAPTER.members.value, unit: '명' })
  const past = events ? pastPublishedCount(events, today) : 0
  if (past > 0) list.push({ id: 'events', label: '지난 행사', value: past, unit: '건' })
  const repos = projects ? publicRepoCount(projects) : 0
  if (repos > 0) list.push({ id: 'projects', label: '공개 프로젝트', value: repos, unit: '개' })
  return list
}

/** 기록: 1기부터 지금 기수까지 연혁 + 기준이 붙은 숫자 한 줄. 비어 있는 부분은 숨긴다 */
export function HistorySection() {
  const gens = sortGenerations(GENERATIONS)
  const facts = useFacts()
  if (gens.length === 0 && facts.length === 0) return null

  const first = gens[0]
  const last = gens[gens.length - 1]
  const line = gens.length > 1 ? `${first.n}기부터 ${last.n}기까지, 공개된 기록만 모았습니다.` : '공개된 기록만 모았습니다.'
  const asOf = CHAPTER.members?.asOf ?? CHAPTER.updatedAt

  return (
    <Section id="history" title="기록" line={line}>
      {gens.length > 0 && (
        <ol className={s.timeline} style={{ ['--cols' as string]: Math.min(gens.length, 4) }}>
          {gens.map((g) => {
            const period = generationPeriod(g)
            return (
              <li key={g.n} className={`${s.gen} ${g.current ? s.genNow : ''}`} aria-current={g.current ? 'true' : undefined}>
                <div className={s.genHead}>
                  <p className={s.genN}>
                    {g.n}기{g.current && <span className="visually-hidden"> (지금 기수)</span>}
                  </p>
                  <p className={s.genName} lang="en">
                    {g.name}
                  </p>
                  {period ? <p className={`num ${s.genPeriod}`}>{period}</p> : <p className={s.genPeriodNone}>기간 기록 없음</p>}
                </div>
                {g.highlights.length > 0 && (
                  <ul className={s.genList}>
                    {g.highlights.slice(0, 3).map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      )}
      {facts.length > 0 && (
        <p className={s.tally}>
          {facts.map((f) => (
            <span key={f.id} className={s.tallyItem}>
              {f.label} <span className={`num ${s.tallyValue}`}>{f.value.toLocaleString('ko-KR')}</span>
              {f.unit}
            </span>
          ))}
          {asOf && <span className={s.tallyItem}>{dotMonth(asOf)} 기준</span>}
        </p>
      )}
    </Section>
  )
}
