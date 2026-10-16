import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import s from './pages.module.css'

/** 화면을 그리다 오류가 났을 때. 머리말이 없을 수 있으므로 혼자서도 읽히게 만든다 */
export function ErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  if (import.meta.env.DEV) console.error(error)
  return (
    <main className={s.page}>
      <header className={s.head}>
        <div>
          <h1>{notFound ? '페이지를 찾을 수 없습니다' : '화면을 불러오지 못했습니다'}</h1>
          <p>{notFound ? '주소를 다시 확인해 주세요.' : '잠시 뒤 새로고침해 주세요. 계속되면 운영진에게 알려 주세요.'}</p>
        </div>
      </header>
      <Link className={s.back} to="/">
        ← 홈으로
      </Link>
    </main>
  )
}
