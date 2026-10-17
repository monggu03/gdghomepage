import { lazy, Suspense, type ReactNode } from 'react'
import type { PagePlanId } from '@/config/pages'

/**
 * 첫 화면(홈)만 처음 받는 파일에 넣고, 나머지 페이지는 들어갈 때 받는다.
 * 받는 동안에는 머리말 · 꼬리말은 그대로 두고 본문 자리만 비워 둔다 (꼬리말이 위로 튀지 않게 높이를 잡는다).
 */
function Loading({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>{children}</Suspense>
}

const Projects = lazy(() => import('@/features/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })))
const Community = lazy(() => import('@/features/pages/CommunityPage').then((m) => ({ default: m.CommunityPage })))
const Recruits = lazy(() => import('@/features/pages/RecruitsPage').then((m) => ({ default: m.RecruitsPage })))
const Planned = lazy(() => import('@/features/pages/PlannedPage').then((m) => ({ default: m.PlannedPage })))
const NotFound = lazy(() => import('@/features/pages/PlannedPage').then((m) => ({ default: m.NotFoundPage })))
const Now = lazy(() => import('@/features/now/NowPreview').then((m) => ({ default: m.NowPreview })))
const Campus = lazy(() => import('@/features/campus/CampusPreview').then((m) => ({ default: m.CampusPreview })))

export function ProjectsPage() {
  return <Loading><Projects /></Loading>
}
export function CommunityPage() {
  return <Loading><Community /></Loading>
}
export function RecruitsPage() {
  return <Loading><Recruits /></Loading>
}
export function PlannedPage({ id }: { id: PagePlanId }) {
  return <Loading><Planned id={id} /></Loading>
}
export function NotFoundPage() {
  return <Loading><NotFound /></Loading>
}
export function NowPreview() {
  return <Loading><Now /></Loading>
}
export function CampusPreview() {
  return <Loading><Campus /></Loading>
}
