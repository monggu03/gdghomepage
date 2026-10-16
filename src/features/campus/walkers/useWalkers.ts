import { useEffect, useRef, type RefObject } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { WalkerLayer } from './WalkerLayer'

/**
 * 장면에 걷는 사람을 붙이는 훅. 실제 움직임은 WalkerLayer(React 바깥)가 맡고,
 * 이 훅은 만들고(마운트) · 매 프레임 움직이고 · 치우는(언마운트) 시점만 잡는다.
 * 정적 장면은 처음 그린 뒤 순서가 바뀌지 않으므로, 끼워 넣은 노드와 React 가 부딪히지 않는다.
 */
export function useWalkers(worldRef: RefObject<SVGGElement | null>, count: number, animate: boolean) {
  const layerRef = useRef<WalkerLayer | null>(null)

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

  useAnimationLoop(worldRef, (dt, time) => layerRef.current?.step(dt, time), animate)
}
