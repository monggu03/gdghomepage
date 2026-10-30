import { useEffect, useRef, type RefObject } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { WalkerLayer } from './WalkerLayer'

/** 걷는 사람을 다시 그리는 간격 (≈30fps). 60Hz 의 두 프레임(33.3ms)이 확실히 넘도록 조금 짧게 */
const STEP_SECONDS = 1 / 30 - 0.002

/**
 * 장면에 걷는 사람을 붙이는 훅. 실제 움직임은 WalkerLayer(React 바깥)가 맡고,
 * 이 훅은 만들고(마운트) · 매 프레임 움직이고 · 치우는(언마운트) 시점만 잡는다.
 * 정적 장면은 처음 그린 뒤 순서가 바뀌지 않으므로, 끼워 넣은 노드와 React 가 부딪히지 않는다.
 */
export function useWalkers(worldRef: RefObject<SVGGElement | null>, count: number, animate: boolean, focusX: number | null = null) {
  const layerRef = useRef<WalkerLayer | null>(null)

  // 건물에 마우스를 올리면 사람들이 그쪽을 돌아본다 (화면 x 하나만 넘긴다)
  useEffect(() => {
    layerRef.current?.setFocus(focusX)
  }, [focusX])

  useEffect(() => {
    const world = worldRef.current
    if (!world) return
    const layer = new WalkerLayer(world, count)
    layerRef.current = layer
    return () => {
      layer.destroy()
      layerRef.current = null
    }
  }, [worldRef, count])

  // 사람은 작고 느려서 초당 30번이면 충분하다: 프레임 사이 시간을 모았다가 1/30초가 차면 한 번에 움직인다
  // (60Hz 화면은 두 프레임에 한 번, 120Hz 는 네 프레임에 한 번). 처음 한 번(dt 0)은 바로 그린다
  const pending = useRef(0)
  useAnimationLoop(
    worldRef,
    (dt, time) => {
      pending.current += dt
      if (dt > 0 && pending.current < STEP_SECONDS) return
      const elapsed = pending.current
      pending.current = 0
      layerRef.current?.step(elapsed, time)
    },
    animate,
  )
}
