import { Fragment, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PLACE_BY_ID, placeColor } from '@/config/places'
import { SPRINT } from '@/config/site'
import { CHAPTER, CONTENT_UPDATED_AT, isPublicProject, projectsBasis } from '@/content'
import { useProjects } from '@/data/queries'
import type { Project } from '@/domain/types'
import { useToday } from '@/hooks/useToday'
import { ddayLabel } from '@/lib/date'
import { dateLabel } from './format'
import { ExternalLink, PageHead, Section, StateLine, ToggleGroup } from './PageParts'
import { groupProjects, projectLinks, projectMetaParts, projectYears } from './projectGroups'
import { stepStates } from './timeline'
import { StepRail } from './Timelines'
import s from './pages.module.css'
import p from './projects.module.css'

const EMPTY: Project[] = []
const PROJECT_COLOR = placeColor('projects')

/**
 * 프로젝트 하나: 이름 / 한 줄 설명 / 기수 · 프로그램 · 기술 / 'GitHub ↗' '서비스 ↗'.
 * 사진이 없으므로 표지를 그리지 않는다. 이름이 서비스(없으면 챕터 저장소)로 가는 링크이고,
 * 그 누르는 자리를 항목 전체로 넓힌다. 아래 링크는 따로 누를 수 있다. 개인 저장소는 걸지 않는다.
 * withProgram: 묶음 제목이 프로그램 · 연도를 말하지 않을 때만 한 줄 정보에 넣는다 (연도는 한 번만).
 */
function ProjectItem({ project, level, withProgram }: { project: Project; level: 3 | 4; withProgram: boolean }) {
  const { primary: href, repo, url } = projectLinks(project, isPublicProject)
  const Heading = level === 3 ? 'h3' : 'h4'
  const meta = projectMetaParts(project, withProgram)
  return (
    <li className={`${p.item} ${href ? p.linked : ''}`}>
      <Heading className={p.name}>
        {href ? (
          <a className={p.stretch} href={href} target="_blank" rel="noreferrer">
            {project.name}
            <span className="visually-hidden"> (새 창)</span>
          </a>
        ) : (
          project.name
        )}
      </Heading>
      {project.summary && <p className={p.summary}>{project.summary}</p>}
      {meta.length > 0 && (
        <p className={p.meta}>
          {/* '·' 는 앞 낱말에 붙여, 줄이 '· PostgreSQL' 처럼 점으로 시작하지 않게 한다 */}
          {meta.map((m, i) => (
            <Fragment key={`${i}-${m}`}>
              {i > 0 && ' '}
              <span className={p.metaPart}>
                {m}
                {i < meta.length - 1 && ' ·'}
              </span>
            </Fragment>
          ))}
        </p>
      )}
      {(repo || url) && (
        <p className={p.links}>
          {repo && (
            <ExternalLink href={repo} context={project.name}>
              GitHub
            </ExternalLink>
          )}
          {url && (
            <ExternalLink href={url} context={project.name}>
              서비스
            </ExternalLink>
          )}
        </p>
      )}
    </li>
  )
}

/** 4기 G-Sprint 진행 상황. 단계 날짜는 config/site.ts 의 확정 일정 */
function SprintNow({ today }: { today: string }) {
  const states = stepStates(
    SPRINT.steps.map((st) => (st.label === '개발' ? null : st.date)),
    today,
  )
  const sprint = CHAPTER.sprint
  const demo = dateLabel(SPRINT.demoDay, null, today)
  return (
    <div className={p.sprint}>
      <div className={p.sprintHead}>
        <h3>
          <span className="num">{sprint.generation}</span>기 G-Sprint
        </h3>
      </div>
      <p className={p.sprintLead}>한 학기 동안 팀을 꾸려 기획부터 배포까지 직접 하는 프로젝트입니다.</p>
      <StepRail
        label={`${sprint.generation}기 G-Sprint 단계`}
        color={PROJECT_COLOR}
        steps={SPRINT.steps.map((st, i) => {
          const dated = st.label !== '개발'
          return {
            id: st.label,
            label: st.label,
            when: dated ? dateLabel(st.date, null, today) : st.when,
            dateTime: dated ? st.date : undefined,
            state: states[i],
            note: states[i] === 'next' && dated ? <span className="num">{ddayLabel(st.date, today)}</span> : undefined,
          }
        })}
      />
      <p className={p.sprintNote}>
        {sprint.verified ? (
          <>
            <span className="num">{sprint.teams}</span>팀 <span className="num">{sprint.members}</span>명 · <span className="num">{demo}</span> 데모데이에서 공개
          </>
        ) : (
          <>
            팀과 주제는 <span className="num">{demo}</span> 데모데이에서 공개합니다.
          </>
        )}
      </p>
    </div>
  )
}

/** 프로젝트: 진행 중(G-Sprint) → 지난 프로젝트(프로그램 · 연도별) */
export function ProjectsPage() {
  const today = useToday()
  const [params, setParams] = useSearchParams()
  const { data, isPending, isError, refetch } = useProjects()
  const projects = data ?? EMPTY
  const done = useMemo(() => projects.filter((pr) => pr.status === 'done'), [projects])
  const ongoing = useMemo(() => projects.filter((pr) => pr.status === 'in-progress'), [projects])
  // 숫자는 공개 기준(GitHub GDSC-DGU 조직 저장소)으로 센다. src/content 의 PUBLIC_PROJECTS 와 같은 기준
  const publicCount = done.filter(isPublicProject).length
  const years = projectYears(done)
  const yearParam = Number(params.get('year'))
  const year = years.includes(yearParam) ? yearParam : null
  const groups = groupProjects(year === null ? done : done.filter((pr) => pr.year === year))
  const sprintRunning = today <= SPRINT.demoDay

  const status = isPending ? (
    <StateLine>프로젝트를 불러오는 중입니다.</StateLine>
  ) : isError ? (
    <StateLine onRetry={() => void refetch()}>프로젝트를 불러오지 못했습니다.</StateLine>
  ) : null

  return (
    <div className={`container ${s.page}`}>
      <PageHead
        mark={PROJECT_COLOR}
        eyebrow={PLACE_BY_ID.projects.sub}
        title="프로젝트"
        lead="멤버들이 팀을 꾸려 직접 만든 서비스를 모았습니다. 지금은 4기 G-Sprint가 진행 중입니다."
        meta={
          <>
            {publicCount > 0 && (
              <>
                지난 프로젝트 <span className="num">{publicCount}</span>개 · {projectsBasis} ·{' '}
              </>
            )}
            <span className="num">{dateLabel(CONTENT_UPDATED_AT, null, today)}</span> 갱신
          </>
        }
      />

      {(sprintRunning || ongoing.length > 0) && (
        <Section id="now" title="진행 중" desc="이번 학기 G-Sprint와 아직 만들고 있는 프로젝트입니다.">
          {sprintRunning && <SprintNow today={today} />}
          {ongoing.length > 0 && (
            <ul className={p.list} aria-label="만들고 있는 프로젝트">
              {ongoing.map((pr) => (
                <ProjectItem key={pr.id} project={pr} level={3} withProgram />
              ))}
            </ul>
          )}
        </Section>
      )}

      <Section id="archive" title="지난 프로젝트" desc="프로그램별로 묶었습니다. 이름을 누르면 서비스나 저장소로 갑니다.">
        {status ??
          (done.length === 0 ? (
            <StateLine>
              아직 옮겨 온 지난 프로젝트가 없습니다. 지난 기수의 저장소는{' '}
              <ExternalLink href={CHAPTER.github} className={s.inlineLink}>
                GitHub GDSC-DGU
              </ExternalLink>
              에서 볼 수 있습니다.
            </StateLine>
          ) : (
            <>
              {years.length > 1 && (
                <div className={s.filters}>
                  <ToggleGroup
                    label="연도"
                    value={year === null ? 'all' : String(year)}
                    onChange={(v) => setParams(v === 'all' ? new URLSearchParams() : new URLSearchParams({ year: v }), { replace: true, preventScrollReset: true })}
                    options={[{ id: 'all', label: '전체' }, ...years.map((y) => ({ id: String(y), label: <span className="num">{y}</span> }))]}
                  />
                </div>
              )}
              <div className={p.groups}>
                {groups.map((g) => (
                  <div key={g.key}>
                    <div className={s.genHead}>
                      <h3>
                        {g.program}
                        {g.year !== null && (
                          <>
                            {' '}
                            · <span className="num">{g.year}</span>
                          </>
                        )}
                      </h3>
                      <p className={`${s.genCount} num`}>{g.projects.length}개</p>
                    </div>
                    <ul className={p.cards} aria-label={g.year === null ? g.program : `${g.program} ${g.year}`}>
                      {g.projects.map((pr) => (
                        <ProjectItem key={pr.id} project={pr} level={4} withProgram={g.year === null} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ))}
      </Section>
    </div>
  )
}
