import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTER, PROJECTS, isPublicProject } from '@/content'
import { FEATURED_PROJECTS, PROJECTS_STORY } from '@/content/story'
import { useProjects } from '@/data/queries'
import type { Project, ProjectImage } from '@/domain/types'
import { StorySection } from '@/features/common'
import { ExhibitCard, WorkList } from '@/features/pages/projects/ExhibitCard'
import { assetUrl, projectGallery } from '@/features/pages/projects/exhibit'
import { sheetSearch } from '@/features/pages/projects/sheetLink'
import { fill, pickProjects, projectCounts, projectMeta, restProjects, tileShots } from './homeData'
import { RoughMark } from '@/features/common/RoughMark'
import s from './projects.module.css'

const BIG = 2
/** 나머지 목록 id (폰 펼치기 버튼이 가리킨다) */
const REST_ID = 'home-rest-projects'
/** GitHub 조직 이름 ('https://github.com/GDSC-DGU' → 'GDSC-DGU') */
const ORG = CHAPTER.github.replace(/\/+$/, '').split('/').pop() ?? 'GDSC-DGU'

/** float: 큰 타일의 겹친 폰 화면 (스크롤할 때 조금 빨리 움직인다, motion/homeStory) */
function Shot({ img, className, float }: { img: ProjectImage; className: string; float?: boolean }) {
  return <img className={className} src={assetUrl(img.src)} alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" data-float={float ? '' : undefined} />
}

/**
 * 큰 타일: 팀이 만든 실제 그림을 크게 (16:10, radius 20) + 이름표(이름 · 프로그램 · 기수 → 한 줄).
 * 실제 화면이면 같은 화면의 폰 화면을 오른쪽에 겹친다 (기기 틀 없이 1px 선, 위에 놓인 폰에만 그림자).
 * 링크는 이름 하나이고, 그 링크가 타일 전체를 덮는다 (누르면 /projects?p=id 자세히 보기 창). 그림은 링크 밖이라 alt 를 그대로 읽는다.
 */
function BigTile({ p }: { p: Project }) {
  const { wide, phone } = tileShots(projectGallery(p))
  return (
    <li className={s.tile}>
      <div className={`${s.media} ${phone ? s.duo : ''}`}>
        {wide && <Shot img={wide} className={phone ? s.desk : s.cover} />}
        {phone && <Shot img={phone} className={s.phone} float />}
      </div>
      <div className={s.label}>
        <div className={s.titleRow}>
          <h3 className={s.name}>
            <Link className={s.open} to={{ pathname: '/projects', search: sheetSearch(p.id) }}>
              {p.name}
            </Link>
          </h3>
          <p className={s.meta}>{projectMeta(p)}</p>
        </div>
        {p.summary && <p className={s.summary}>{p.summary}</p>}
      </div>
    </li>
  )
}

/** 틀의 {key} 를 값으로 바꾸되, 값은 한 덩어리로 (GDSC-DGU 가 하이픈에서 줄이 바뀌지 않게) */
function fillKeep(template: string, vars: Record<string, string | number>) {
  return template.split(/(\{\w+\})/).map((part, i) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1]
    return key && key in vars ? (
      <span key={i} className={s.keep}>
        {vars[key]}
      </span>
    ) : (
      part
    )
  })
}

/** '{n}' 자리에 숫자 글꼴로 n 을 넣는다 (주장 제목) */
function withNum(template: string, n: number) {
  const [before, after = ''] = template.split('{n}')
  return (
    <Fragment>
      {before}
      {/* 손으로 두른 동그라미 (Rough Notation): 이 섹션의 주장 숫자 하나에만 */}
      <RoughMark type="circle" color="var(--place-projects)" padding={[2, 7]}>
        <span className="num">{n}</span>
        {after}
      </RoughMark>
    </Fragment>
  )
}

/**
 * 프로젝트 (이야기 섹션): '팀으로 만들어 공개한 서비스 {n}개'.
 * 큰 실물 둘(실제 화면 큰 타일 2장) + 나머지 완성 프로젝트 전부(아이콘 · 이름 · 한 줄 목록, /projects 전시실과 같은 모양)로
 * 크기 위계를 두면서 '지금까지 만든 것'을 다 보여 준다 (팀 피드백 2026-10-28).
 * 폰은 목록을 PROJECTS_STORY.phoneFirst 개만 먼저 보이고 '프로젝트 N개 더 보기' 로 펼친다 (넓은 화면은 처음부터 전부, 버튼 없음).
 * 숫자는 projects.json 에서 센다: 공개 저장소가 있는 완성 프로젝트 수 · 그중 Solution Challenge 수. 커밋 합계는 쓰지 않는다.
 * 데이터를 서버에서 받기 전에도 저장소 스냅샷(PROJECTS)으로 먼저 그린다 (섹션이 늦게 끼어들어 화면이 밀리지 않게).
 */
export function ProjectsSection() {
  const { data } = useProjects()
  const [expanded, setExpanded] = useState(false)
  const list = (data ?? PROJECTS).filter(isPublicProject)
  const { done, solutionChallenge } = projectCounts(list)
  if (done === 0) return null

  const big = pickProjects(
    list.filter((p) => tileShots(projectGallery(p)).wide),
    FEATURED_PROJECTS.big,
    BIG,
  )
  const rest = restProjects(
    list,
    big.map((p) => p.id),
  )
  const hiddenOnPhone = Math.max(0, rest.length - PROJECTS_STORY.phoneFirst)

  // 펼치면 새로 보인 첫 작품으로 초점을 옮긴다 (키보드 · 화면 읽기 사용자가 어디부터인지 알게)
  const expand = () => {
    setExpanded(true)
    requestAnimationFrame(() => {
      document.getElementById(REST_ID)?.querySelectorAll<HTMLAnchorElement>('li h3 a')[PROJECTS_STORY.phoneFirst]?.focus()
    })
  }

  return (
    <StorySection
      id="projects"
      className={s.section}
      eyebrow={PROJECTS_STORY.eyebrow}
      placeColor="var(--place-projects)"
      title={withNum(PROJECTS_STORY.title, done)}
      sub={PROJECTS_STORY.sub.map((line, i) => (
        <span key={line} className={s.subLine}>
          {i > 0 && ' '}
          {fillKeep(line, { sc: solutionChallenge, org: ORG })}
        </span>
      ))}
      action={
        <Link className="link-go" to="/projects">
          {fill(PROJECTS_STORY.more, { n: done })}
        </Link>
      }
    >
      {big.length > 0 && (
        <ul className={s.tiles}>
          {big.map((p) => (
            <BigTile key={p.id} p={p} />
          ))}
        </ul>
      )}
      {rest.length > 0 && (
        <div className={s.rest}>
          <WorkList id={REST_ID} className={s.restList} expanded={expanded} label={PROJECTS_STORY.restLabel}>
            {rest.map((p) => (
              <ExhibitCard key={p.id} project={p} withProgram level={3} linkTo="/projects" />
            ))}
          </WorkList>
          {hiddenOnPhone > 0 && !expanded && (
            <button type="button" className={`btn-secondary ${s.more}`} aria-expanded={false} aria-controls={REST_ID} onClick={expand}>
              {fill(PROJECTS_STORY.moreOnPhone, { n: hiddenOnPhone })}
            </button>
          )}
        </div>
      )}
    </StorySection>
  )
}
