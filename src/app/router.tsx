import { createBrowserRouter, createHashRouter, type RouteObject } from 'react-router-dom'
import { PAGE_PLAN_IDS } from '@/config/pages'
import { HomePage } from '@/features/home/HomePage'
import { AppLayout } from '@/features/layout/AppLayout'
import { ErrorPage } from '@/features/pages/ErrorPage'
import { NotFoundPage, PlannedPage } from '@/features/pages/PlannedPage'

/** 다 만든 페이지. 준비 중 페이지를 실제로 만들면 여기로 옮긴다 */
const BUILT_ROUTES: RouteObject[] = [{ index: true, element: <HomePage /> }]

/** config/pages.ts 에 계획만 있는 페이지는 자동으로 '준비 중' 페이지가 된다 */
const PLANNED_ROUTES: RouteObject[] = PAGE_PLAN_IDS.map((id) => ({ path: id, element: <PlannedPage id={id} /> }))

const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    // 화면을 그리다 오류가 나면 흰 화면 대신 안내를 보여준다
    errorElement: <ErrorPage />,
    children: [...BUILT_ROUTES, ...PLANNED_ROUTES, { path: '*', element: <NotFoundPage /> }],
  },
]

/**
 * 보통은 /projects 같은 주소(browser).
 * 서버 설정 없이 파일만 올리는 미리보기에서는 #/projects 주소(hash)를 쓴다: VITE_ROUTER=hash
 */
export const router = import.meta.env.VITE_ROUTER === 'hash' ? createHashRouter(routes) : createBrowserRouter(routes)
