import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

/**
 * requestAnimationFrame 루프 하나.
 * - 대상이 화면 밖에 있거나 다른 탭이면 멈춘다 (배터리·CPU 아끼기)
 * - '동작 줄이기' 설정이면 처음 한 번만 그리고 돌지 않는다
 * - 매 프레임 React 상태를 바꾸지 않는다. tick 안에서 DOM 을 직접 고친다 (리렌더 0번)
 */
export function useAnimationLoop(
  targetRef: RefObject<Element | null>,
  tick: (dt: number, time: number) => void,
  enabled: boolean,
) {
  const tickRef = useRef(tick)
  useLayoutEffect(() => {
    tickRef.current = tick
  })

  useEffect(() => {
    const target = targetRef.current
    if (!target) return
    tickRef.current(0, 0)
    if (!enabled) return

    let raf = 0
    let last = 0
    let running = false
    let visible = true

    const loop = (ts: number) => {
      const dt = Math.min(0.05, (ts - last) / 1000 || 0)
      last = ts
      tickRef.current(dt, ts / 1000)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const sync = () => (visible && !document.hidden ? start() : stop())

    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true
      sync()
    })
    io.observe(target)
    document.addEventListener('visibilitychange', sync)
    sync()

    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [targetRef, enabled])
}
