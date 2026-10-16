import { createBrowserRouter, createHashRouter, type RouteObject } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage'
import { AppLayout } from '@/features/layout/AppLayout'
import { NotFoundPage, PlannedPage } from '@/features/pages/PlannedPage'

/** 메뉴 = 배범서 기획의 상단 메뉴 (Home · Projects · Teams · Community · Recruits) + 관리자 */
const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <PlannedPage id="projects" /> },
      { path: 'teams', element: <PlannedPage id="teams" /> },
      { path: 'community', element: <PlannedPage id="community" /> },
      { path: 'recruits', element: <PlannedPage id="recruits" /> },
      { path: 'admin', element: <PlannedPage id="admin" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

/**
 * 보통은 /projects 같은 주소(browser).
 * 서버 설정 없이 파일만 올리는 미리보기에서는 #/projects 주소(hash)를 쓴다: VITE_ROUTER=hash
 */
export const router = import.meta.env.VITE_ROUTER === 'hash' ? createHashRouter(routes) : createBrowserRouter(routes)
