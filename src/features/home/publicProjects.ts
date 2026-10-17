import * as content from '@/content'
import type { Project } from '@/domain/types'

/**
 * 홈에서 세고 보여 줄 '공개 프로젝트'.
 * content 가 PUBLIC_PROJECTS 를 내보내면 그 목록(id)을 따르고, 없으면 모두를 후보로 둔다.
 * 어느 쪽이든 저장소 링크 · 개수는 챕터 GitHub 조직(CHAPTER.github)의 저장소만 인정한다
 * (개인 저장소에 있는 홈페이지 리뉴얼 같은 작업은 세지도 링크하지도 않는다).
 * content 쪽 작업과 순서가 엇갈려도 깨지지 않게 이름으로 꺼낸다.
 */
const publicList: unknown = Reflect.get(content, 'PUBLIC_PROJECTS')
const PUBLIC_IDS: ReadonlySet<string> | null = Array.isArray(publicList) ? new Set((publicList as Project[]).map((p) => p.id)) : null

const ORG = content.CHAPTER.github.replace(/\/+$/, '').toLowerCase()

/** 'https://github.com/GDSC-DGU' → 'GDSC-DGU' */
export const ORG_NAME = content.CHAPTER.github.replace(/\/+$/, '').split('/').pop() ?? content.CHAPTER.github

/** 챕터 조직의 저장소인지 */
export const isOrgRepo = (repo: string | undefined): repo is string => Boolean(repo && repo.toLowerCase().startsWith(`${ORG}/`))

/** 공개 목록에 든 프로젝트인지 (목록이 없으면 모두) */
export const isPublicProject = (p: Pick<Project, 'id'>) => PUBLIC_IDS === null || PUBLIC_IDS.has(p.id)

/** 카드가 연결할 곳: 챕터 조직 저장소 → 서비스 주소 → 없음 */
export const projectHref = (p: Pick<Project, 'repo' | 'url'>): string | undefined => (isOrgRepo(p.repo) ? p.repo : p.url)

/** 공개되어 있고 챕터 GitHub 에 저장소가 있는 프로젝트 수 */
export const publicRepoCount = (projects: readonly Project[]) => projects.filter((p) => isPublicProject(p) && isOrgRepo(p.repo)).length
