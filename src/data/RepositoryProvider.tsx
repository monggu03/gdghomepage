import { useMemo, type ReactNode } from 'react'
import { createHttpRepositories } from './http/httpRepositories'
import { createMockRepositories } from './mock/mockRepositories'
import { RepositoryContext } from './repositoryContext'
import type { Repositories } from './repositories'

/**
 * 어떤 데이터 구현을 쓸지 한 곳에서 정한다 (의존성 주입).
 * .env 에 VITE_DATA_SOURCE=http 를 넣으면 Spring Boot API 를, 아니면 예시 데이터를 쓴다.
 * 테스트에서는 value 로 가짜 구현을 직접 넣을 수 있다.
 */
export function RepositoryProvider({ value, children }: { value?: Repositories; children: ReactNode }) {
  const repos = useMemo(
    () =>
      value ??
      (import.meta.env.VITE_DATA_SOURCE === 'http'
        ? createHttpRepositories(import.meta.env.VITE_API_BASE ?? '/api')
        : createMockRepositories()),
    [value],
  )
  return <RepositoryContext.Provider value={repos}>{children}</RepositoryContext.Provider>
}
