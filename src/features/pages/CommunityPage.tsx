import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PLACE_BY_ID, placeColor } from '@/config/places'
import { SITE } from '@/config/site'
import { CHAPTER, CONTENT_UPDATED_AT, GENERATIONS } from '@/content'
import { useSchedule } from '@/data/queries'
import type { ScheduleEvent } from '@/domain/types'
import { useToday } from '@/hooks/useToday'
import { ddayLabel } from '@/lib/date'
import { upcomingEvents } from '@/lib/schedule'
import { EventRows } from './EventRows'
import { basisLabel, dateLabel } from './format'
import { ExternalLink, PageHead, Section, StateLine, ToggleGroup } from './PageParts'
import {
  COLLAPSED_COUNT,
  KIND_FILTERS,
  generationRange,
  generationsIn,
  groupByGeneration,
  isKindFilter,
  kindCounts,
  matchesKind,
  pastEvents,
  type GenerationGroup,
  type KindFilterId,
} from './records'
import s from './pages.module.css'

const EMPTY: ScheduleEvent[] = []

/**
 * 다가오는 일정 끝 칸: 첫 줄에만 D-day. 이미 시작한 여러 날 행사는 '진행 중'.
 * 줄마다 D-숫자를 달면 가장 가까운 일정이 묻힌다.
 */
function untilLabel(e: ScheduleEvent, index: number, today: string): string | null {
  if (e.date <= today) return '진행 중'
  return index === 0 ? ddayLabel(e.date, today) : null
}

/** 기수 하나의 행사 기록. 길면 최근 8건만 보이고 나머지는 '더 보기' */
function GenerationBlock({ group, open, onToggle, today }: { group: GenerationGroup; open: boolean; onToggle: () => void; today: string }) {
  const info = group.gen === null ? undefined : GENERATIONS.find((g) => g.n === group.gen)
  const range = info ? generationRange(info) : null
  const listId = `records-${group.gen ?? 'none'}`
  const hidden = group.events.length - COLLAPSED_COUNT
  const shown = open || hidden <= 0 ? group.events : group.events.slice(0, COLLAPSED_COUNT)
  return (
    <div className={s.gen}>
      <div className={s.genHead}>
        <h3>
          {group.gen === null ? (
            '기수 기록 없음'
          ) : (
            <>
              <span className="num">{group.gen}</span>기
            </>
          )}
        </h3>
        {info && (
          <p className={s.genMeta}>
            {info.name}
            {range && (
              <>
                {' '}
                · <span className="num">{range}</span>
              </>
            )}
          </p>
        )}
        <p className={`${s.genCount} num`}>{group.events.length}건</p>
      </div>
      {info?.summary && <p className={s.genSummary}>{info.summary}</p>}
      <EventRows
        id={listId}
        label={group.gen === null ? '기수 기록 없는 행사' : `${group.gen}기 행사`}
        events={shown}
        today={today}
      />
      {hidden > 0 && (
        <button type="button" className={`link ${s.more}`} aria-expanded={open} aria-controls={listId} onClick={onToggle}>
          {open ? '접기' : `${hidden}건 더 보기`}
        </button>
      )}
    </div>
  )
}

/**
 * 행사 기록: 기수 · 종류로 거른다. 거른 상태는 주소의 ?gen=3&kind=session 에 남아 그대로 공유된다.
 */
function Records({ past, today }: { past: readonly ScheduleEvent[]; today: string }) {
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set())

  const gens = generationsIn(past)
  const genParam = Number(params.get('gen'))
  const gen = gens.includes(genParam) ? genParam : null
  const kindParam = params.get('kind')
  const kind: KindFilterId = isKindFilter(kindParam) ? kindParam : 'all'

  const inGen = gen === null ? past : past.filter((e) => e.generation === gen)
  const counts = kindCounts(inGen)
  const shown = inGen.filter((e) => matchesKind(e, kind))
  const groups = groupByGeneration(shown)

  const setParam = (key: 'gen' | 'kind', value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  if (past.length === 0) {
    return (
      <StateLine>
        아직 옮겨 온 행사 기록이 없습니다. 지난 행사는{' '}
        <ExternalLink href={CHAPTER.chapterPage} className={s.inlineLink}>
          gdg.community.dev 챕터 페이지
        </ExternalLink>
        에서 먼저 볼 수 있습니다.
      </StateLine>
    )
  }

  const filtered = gen !== null || kind !== 'all'
  const genLabel = gen === null ? '모든 기수' : `${gen}기`
  const kindLabel = KIND_FILTERS.find((f) => f.id === kind)?.label ?? '전체'
  return (
    <>
      <div className={s.filters}>
        {gens.length > 1 && (
          <ToggleGroup
            label="기수"
            value={gen === null ? 'all' : String(gen)}
            onChange={(v) => setParam('gen', v === 'all' ? null : v)}
            options={[{ id: 'all', label: '전체' }, ...gens.map((g) => ({ id: String(g), label: `${g}기` }))]}
          />
        )}
        <ToggleGroup
          label="종류"
          value={kind}
          onChange={(v) => setParam('kind', v === 'all' ? null : v)}
          options={KIND_FILTERS.map((f) => ({ id: f.id, label: f.label, count: counts[f.id] }))}
        />
      </div>
      {/* 거르지 않았을 때는 '전체 45' 칩과 같은 말이라 화면 읽기 프로그램에만 */}
      <p className={filtered ? s.resultLine : 'visually-hidden'} role="status">
        {genLabel} · {kindLabel} <span className="num">{shown.length}</span>건
        {filtered && (
          <>
            {' '}
            <button type="button" className="link" onClick={() => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })}>
              거르기 풀기
            </button>
          </>
        )}
      </p>
      {groups.length === 0 ? (
        <StateLine>이 조건에 맞는 행사 기록이 없습니다.</StateLine>
      ) : (
        <div className={s.gens}>
          {groups.map((g) => {
            const key = String(g.gen)
            return <GenerationBlock key={key} group={g} today={today} open={open.has(key)} onToggle={() => toggle(key)} />
          })}
        </div>
      )}
    </>
  )
}

/** 커뮤니티: 다가오는 일정 → 기수별 행사 기록 → 게시판 안내 */
export function CommunityPage() {
  const today = useToday()
  const { data, isPending, isError, refetch } = useSchedule()
  const events = data ?? EMPTY
  const past = useMemo(() => pastEvents(events, today), [events, today])
  const upcoming = useMemo(() => upcomingEvents(events, today), [events, today])
  const pastBasis = basisLabel(past.map((e) => e.source))
  const upcomingBasis = basisLabel(upcoming.map((e) => e.source))

  const loading = isPending && <StateLine>일정을 불러오는 중입니다.</StateLine>
  const failed = isError && <StateLine onRetry={() => void refetch()}>일정을 불러오지 못했습니다.</StateLine>

  return (
    <div className={`container ${s.page}`}>
      <PageHead
        mark={placeColor('community')}
        eyebrow={PLACE_BY_ID.community.sub}
        title="커뮤니티"
        lead="화요일 정기 세션과 학기마다 여는 행사를 모았습니다. 다가오는 일정을 먼저, 지난 행사는 기수별로 보여 줍니다."
        meta={
          <>
            {past.length > 0 && (
              <>
                지난 행사 <span className="num">{past.length}</span>건{pastBasis && ` · ${pastBasis} 기준`} ·{' '}
              </>
            )}
            <span className="num">{dateLabel(CONTENT_UPDATED_AT, null, today)}</span> 갱신
          </>
        }
      />

      <Section
        id="upcoming"
        title="다가오는 일정"
        desc={
          <>
            {upcomingBasis ? `${upcomingBasis} 기준입니다. ` : ''}바뀌면 인스타그램에 먼저 알립니다. 휴회 주는 뺐습니다.
          </>
        }
      >
        {loading || failed || (upcoming.length === 0 ? (
          <StateLine>지금 공개된 다가오는 일정이 없습니다. 새 일정은 인스타그램 {SITE.links.instagramHandle}에 먼저 올립니다.</StateLine>
        ) : (
          <EventRows events={upcoming} today={today} label="다가오는 일정" note={(e, i) => untilLabel(e, i, today)} />
        ))}
      </Section>

      <Section id="records" title="행사 기록" desc="끝난 행사를 기수별로 모았습니다. 원래 게시된 행사 페이지가 있으면 함께 걸었습니다." sticky>
        {loading || failed || <Records past={past} today={today} />}
      </Section>

      <Section id="board" title="게시판" quiet>
        <p className={s.note}>
          공지와 정보 공유 글쓰기는 운영진 관리 페이지와 함께 엽니다. 여는 시기는 아직 정하지 않았습니다. 그동안 공지는{' '}
          <ExternalLink href={SITE.links.instagram} className={s.inlineLink}>
            인스타그램 {SITE.links.instagramHandle}
          </ExternalLink>
          에 올립니다.
        </p>
      </Section>
    </div>
  )
}
