import { Outlet, ScrollRestoration } from 'react-router-dom'
import { PlacePreviewProvider } from './PlacePreviewProvider'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/** 모든 페이지의 틀: 본문 바로가기 + 머리말 + 본문 + 꼬리말 */
export function AppLayout() {
  return (
    <PlacePreviewProvider>
      {/* hash 주소(#/…)를 쓰는 미리보기에서도 동작하도록 링크 대신 버튼으로 초점을 옮긴다 */}
      <button type="button" className="skip-link" onClick={() => document.getElementById('main')?.focus()}>
        본문 바로가기
      </button>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </PlacePreviewProvider>
  )
}
