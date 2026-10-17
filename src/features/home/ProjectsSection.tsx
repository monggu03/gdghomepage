import { Link } from 'react-router-dom'
import { placeColor } from '@/config/places'
import { SITE, SPRINT } from '@/config/site'
import { CHAPTER } from '@/content'
import { useProjects } from '@/data/queries'
import type { Project } from '@/domain/types'
import { useToday } from '@/hooks/useToday'
import { dayLabel, latestProjects, projectMeta } from './homeData'
import { isOrgRepo, isPublicProject, ORG_NAME, projectHref } from './publicProjects'
import { Section } from './Section'
import s from './sections.module.css'

const SHOWN = 6

/**
 * 프로젝트 카드: 눌러서 밖으로 나가는 독립 객체라 카드로 (1px 선, 그림자 없음).
 * 저장소는 챕터 GitHub 조직 것만 잇는다 (개인 저장소는 잇지 않는다)
 */
function ProjectCard({ p }: { p: Project }) {
  const href = projectHref(p)
  const repo = isOrgRepo(p.repo)
  const body = (
    <>
      <p className={s.cardMeta}>{projectMeta(p)}</p>
      <h3 className={s.cardTitle}>{p.name}</h3>
      {p.summary && <p className={s.cardText}>{p.summary}</p>}
      {href && <span className={s.cardOut}>{repo ? 'GitHub' : '서비스'} ↗</span>}
    </>
  )
  return (
    <li>
      {href ? (
        <a className={s.card} href={href} target="_blank" rel="noreferrer">
          {body}
        </a>
      ) : (
        <div className={`${s.card} ${s.cardStatic}`}>{body}</div>
      )}
    </li>
  )
}

/** 프로젝트: 지금 진행 중인 G-Sprint 한 줄 + 최근 프로젝트 최대 6개 */
export function ProjectsSection() {
  const today = useToday()
  const { data } = useProjects()
  const projects = latestProjects((data ?? []).filter(isPublicProject), SHOWN)
  const running = today <= SPRINT.demoDay
  const sprint = CHAPTER.sprint?.verified ? CHAPTER.sprint : null
  if (!running && projects.length === 0) return null

  const line = projects.length > 0 ? `GitHub ${ORG_NAME}에 공개된 팀 프로젝트입니다.` : `${SITE.generation} 팀 프로젝트는 데모데이에서 처음 공개합니다.`

  return (
    <Section id="projects" title="프로젝트" line={line}>
      {running && (
        <div className={s.running}>
          <span className={s.runningState}>
            <i className="mark" style={{ ['--c' as string]: placeColor('projects') }} aria-hidden="true" />
            진행 중
          </span>
          <span className={s.runningWhat}>
            {SITE.generation} G-Sprint 팀 프로젝트
            {sprint && (
              <span className={s.runningMeta}>
                {' '}
                · {sprint.teams}팀 {sprint.members}명
              </span>
            )}
          </span>
          <span className={s.runningWhen}>
            <span className="num">{dayLabel(SPRINT.demoDay, today)}</span> 데모데이에서 공개
          </span>
        </div>
      )}
      {projects.length > 0 && (
        <>
          <ul className={s.cards}>
            {projects.map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </ul>
          <p className={s.more}>
            <Link className="link" to="/projects">
              프로젝트 전체 보기
            </Link>
          </p>
        </>
      )}
    </Section>
  )
}
