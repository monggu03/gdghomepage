import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/** 모든 페이지의 틀: 머리말 + 본문 + 꼬리말 */
export function AppLayout() {
  const { pathname } = useLocation()
  const home = pathname === '/'
  return (
    <>
      <SiteHeader variant={home ? 'overlay' : 'bar'} />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  )
}
