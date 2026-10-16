import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface AsyncState<T> {
  data: T | undefined
  error: Error | undefined
  loading: boolean
}

interface Settled<T> {
  key: string
  data?: T
  error?: Error
}

/**
 * Promise 를 돌려주는 함수를 불러 결과를 들고 있는 작은 훅.
 * key 가 바뀌면 다시 부른다 (TanStack Query 의 queryKey 와 같은 생각).
 * 팀에서 TanStack Query 를 쓰기로 하면 useAsync(key, fn) → useQuery({ queryKey: [key], queryFn: fn }) 로 바꾸면 된다.
 */
export function useAsync<T>(key: string, fn: () => Promise<T>): AsyncState<T> {
  const fnRef = useRef(fn)
  useLayoutEffect(() => {
    fnRef.current = fn
  })
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    let alive = true
    fnRef.current().then(
      (data) => alive && setSettled({ key, data }),
      (e: unknown) => alive && setSettled({ key, error: e instanceof Error ? e : new Error(String(e)) }),
    )
    return () => {
      alive = false
    }
  }, [key])

  const fresh = settled?.key === key
  return { data: fresh ? settled.data : undefined, error: fresh ? settled.error : undefined, loading: !fresh }
}
