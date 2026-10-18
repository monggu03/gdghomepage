import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useHashScroll } from './community/useHashScroll'
import { PLACE_BY_ID } from '@/config/places'
import { SPRINT } from '@/config/site'
import { CHAPTER, CONTENT_UPDATED_AT, isPublicProject, projectsBasis } from '@/content'
import { useProjects } from '@/data/queries'
import type { Project } from '@/domain/types'
import { JoinStrip } from '@/features/common'
import { Term } from '@/features/glossary/Term'
import { PlaceHero, type DirectoryRow } from '@/features/placehero/PlaceHero'
import { useToday } from '@/hooks/useToday'
import { shortDate } from '@/lib/date'
import { dateLabel } from './format'
import { ExternalLink, StateLine } from './PageParts'
import { groupProjects, OTHER_PROGRAMS } from './projectGroups'
import { ExhibitCard, FeaturedWork, WorkList } from './projects/ExhibitCard'
import { neighbors, toRooms, type Room } from './projects/exhibit'
import { ProjectSheet } from './projects/ProjectSheet'
import { isSheetState, SHEET_PARAM } from './projects/sheetLink'
import { SprintBand } from './projects/SprintBand'
import s from './pages.module.css'
import p from './projects.module.css'

const EMPTY: Project[] = []

/**
 * 전시실 하나: 머리 한 줄(2px 먹선 → 큰 해 · 프로그램 | 오른쪽 끝 기수 · 개수) → 대표 작품 크게 → 나머지 줄 목록.
 * first: 페이지 첫 전시실 (대표 작품 그림을 먼저 불러온다)
 */
function RoomSection({ room, first }: { room: Room; first: boolean }) {
  const other = room.title === OTHER_PROGRAMS
  const gens = room.generations.map((n) => `${n}기`).join(' · ')
  const rest = room.projects.filter((pr) => pr !== room.featured)
  return (
    <section id={room.id} className={p.room} aria-labelledby={`${room.id}-title`}>
      <header className={p.roomHead}>
        {/* 같은 프로그램 이름(Solution Challenge)이 해마다 있으므로 제목에 연도까지 넣는다 */}
        <h3 id={`${room.id}-title`} className={p.roomTitle}>
          <span className={`${p.roomYear} num`}>{room.yearLabel}</span>
          <span className={p.roomProgram}>{room.title}</span>
        </h3>
        <p className={p.roomMeta}>
          {!other && gens && <>{gens} · </>}
          <span className="num">{room.projects.length}</span>개
        </p>
      </header>
      {room.featured && <FeaturedWork project={room.featured} eager={first} />}
      {rest.length > 0 && (
        <WorkList label={room.featured ? `${room.yearLabel} ${room.title}의 다른 프로젝트` : `${room.yearLabel} ${room.title}`}>
          {rest.map((pr) => (
            <ExhibitCard key={pr.id} project={pr} withProgram={other} />
          ))}
        </WorkList>
      )}
    </section>
  )
}

/**
 * 프로젝트 (시안 E '전시장'): 건물 앞 머리 → 전시실(해 · 프로그램마다 한 방, 실제 화면부터) → 먹색 4기 G-Sprint 띠 → JoinStrip.
 * 작품을 누르면 자세히 보기 창(?p=id). 주소를 그대로 보내면 같은 창이 열린다.
 */
export function ProjectsPage() {
  const today = useToday()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  // 홈 '어떻게 하나요'의 G-Sprint 줄 · 안내판에서 /projects#now 로 들어오면 그 섹션으로 내려간다
  useHashScroll(true)
  const navigate = useNavigate()
  const { data, isPending, isError, refetch } = useProjects()
  const projects = data ?? EMPTY
  const done = useMemo(() => projects.filter((pr) => pr.status === 'done'), [projects])
  const ongoing = useMemo(() => projects.filter((pr) => pr.status === 'in-progress'), [projects])
  // 숫자는 공개 기준(GitHub GDSC-DGU 조직 저장소)으로 센다. src/content 의 PUBLIC_PROJECTS 와 같은 기준
  const publicCount = done.filter(isPublicProject).length
  // 용어 풀이 줄: 지난 프로젝트 중 Solution Challenge 에서 만든 것 (projects.json program 기준)
  const challengeCount = done.filter((pr) => isPublicProject(pr) && pr.program.startsWith('Solution Challenge')).length
  const rooms = useMemo(() => toRooms(groupProjects(done)), [done])
  const sprint = CHAPTER.sprint
  const sprintRunning = today <= SPRINT.demoDay

  /* ── 자세히 보기 창: 주소의 ?p=<id> 가 곧 열린 상태 ── */
  const openId = params.get(SHEET_PARAM)
  const open = openId ? (done.find((pr) => pr.id === openId) ?? null) : null
  const { prev, next } = open ? neighbors(rooms, open.id) : {}
  const openRoom = open ? rooms.find((r) => r.projects.includes(open)) : undefined
  const live = useRef({ params, state: location.state as unknown })
  const lastOpen = useRef<string | null>(null)
  useEffect(() => {
    live.current = { params, state: location.state }
  }, [params, location.state])
  useEffect(() => {
    if (open) lastOpen.current = open.id
  }, [open])

  const onSheetClosed = useCallback(() => {
    const { params: cur, state } = live.current
    if (cur.get(SHEET_PARAM)) {
      // 페이지 안에서 연 창이면 한 칸 뒤로, 주소로 바로 들어왔으면 ?p 만 떼고 이 페이지에 남는다
      if (isSheetState(state)) navigate(-1)
      else {
        const rest = new URLSearchParams(cur)
        rest.delete(SHEET_PARAM)
        setParams(rest, { replace: true, preventScrollReset: true })
      }
    }
    // 연 자리를 모르면(주소로 바로 연 창) 그 작품으로 초점을 옮긴다
    requestAnimationFrame(() => {
      const active = document.activeElement
      // 초점이 이미 페이지의 어딘가로 돌아갔으면 그대로 둔다 (닫히는 창 안이나 body 면 옮긴다)
      if (active && active !== document.body && active.id !== 'main' && !active.closest('dialog')) return
      const id = lastOpen.current
      if (id) document.querySelector<HTMLElement>(`[data-sheet-card="${CSS.escape(id)}"]`)?.focus()
    })
  }, [navigate, setParams])

  // 건물 안내판: 지금(4기 G-Sprint) 한 줄 + 전시실마다 한 줄
  const directory: DirectoryRow[] = [
    {
      label: 'G-Sprint',
      value:
        sprint.verified && sprintRunning ? (
          <>
            <span className="num">{sprint.teams}</span>팀 진행 중
          </>
        ) : (
          <>
            <span className="num">{shortDate(SPRINT.demoDay, today)}</span> 데모데이
          </>
        ),
      href: '#now',
      current: true,
    },
    ...rooms.map((r) => ({
      label: r.title,
      value: (
        <>
          <span className="num">{r.yearLabel}</span> · <span className="num">{r.projects.length}</span>개
        </>
      ),
      href: `#${r.id}`,
    })),
  ]

  const status = isPending ? (
    <StateLine>프로젝트를 불러오는 중입니다.</StateLine>
  ) : isError ? (
    <StateLine onRetry={() => void refetch()}>프로젝트를 불러오지 못했습니다.</StateLine>
  ) : null

  return (
    <div className={`container ${s.page}`}>
      <PlaceHero
        place="projects"
        eyebrow={PLACE_BY_ID.projects.sub}
        title="프로젝트"
        lead={
          <>
            멤버들이 팀을 꾸려 직접 만든 서비스를 모았습니다.
            {/* 처음 보는 이름 풀이 한 줄: Solution Challenge (G-Sprint 는 아래 먹색 띠가 풀어 쓴다) */}
            {challengeCount > 0 && (
              <span className={p.leadNote}>
                지난 프로젝트 <span className="num">{publicCount}</span>개 중 <span className="num">{challengeCount}</span>개는 <Term id="solution-challenge" />
                {'⁠'}에서 만들었습니다.
              </span>
            )}
          </>
        }
        meta={
          <>
            {projectsBasis} · <span className="num">{dateLabel(CONTENT_UPDATED_AT, null, today)}</span> 갱신
          </>
        }
        directory={directory}
      />

      {/* 전시실: 머리 바로 아래, 그림부터 (제목은 읽기 프로그램용. 보이는 머리는 방마다의 해 · 프로그램) */}
      <section id="archive" className={`story paper ${p.archive}`} aria-labelledby="archive-title">
        <h2 id="archive-title" className="visually-hidden">
          지난 프로젝트 {publicCount}개
        </h2>
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
            <div className={p.rooms}>
              {rooms.map((r, i) => (
                <RoomSection key={r.id} room={r} first={i === 0} />
              ))}
            </div>
          ))}
        {/* 자세히 보기 창 (dialog: 맨 위 층에 뜨므로 놓인 자리는 화면에 영향이 없다. JoinStrip 이 본문 마지막이어야 꼬리말이 붙는다) */}
        <ProjectSheet
          project={open}
          prev={prev}
          next={next}
          roomTitle={openRoom ? `${openRoom.yearLabel} ${openRoom.title}` : undefined}
          position={openRoom && open ? [openRoom.projects.indexOf(open) + 1, openRoom.projects.length] : undefined}
          walkState={location.state}
          onClosed={onSheetClosed}
        />
      </section>

      <SprintBand today={today} ongoing={ongoing} />

      <JoinStrip />
    </div>
  )
}
