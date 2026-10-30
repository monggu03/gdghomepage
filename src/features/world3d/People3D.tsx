import { memo, useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { BENCHES, PEOPLE, SITTERS } from '@/features/campus/layout'
import { FOOT_X, PEEP_K, PEEPS, seatOf, SIT_HIP, type PeepId } from '@/features/campus/peeps/peepArt'
import { ISO_UNIT, Z_SCALE } from './projection'

/** 그림 한 장 높이 (px). 지도에서 사람은 37 SVG 단위라, 2배 화면 · 확대(1.65배)까지 또렷하게 */
const TEX_H = 160

/** Open Peeps 선 그림(SVG) 한 자세를 캔버스 그림(텍스처)으로 */
function peepTexture(id: PeepId): Promise<CanvasTexture> {
  const art = PEEPS[id]
  const s = TEX_H / art.h
  const w = Math.ceil(art.w * s)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.w} ${art.h}" width="${w}" height="${TEX_H}">${art.art}</svg>`
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = w
      c.height = TEX_H
      c.getContext('2d')!.drawImage(img, 0, 0, w, TEX_H)
      const t = new CanvasTexture(c)
      t.colorSpace = SRGBColorSpace
      t.anisotropy = 4
      resolve(t)
    }
    img.onerror = reject
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

interface Figure {
  key: string
  pose: PeepId
  /** 세계 좌표 (눌리지 않은 공간: X = 격자 x, Y = 높이 · Z_SCALE, Z = 격자 y) */
  at: [number, number, number]
  /** 그림에서 세우는 점 (0~1, 왼쪽 아래가 0,0) */
  center: [number, number]
  flip: boolean
  standing: boolean
}

const FIGURES: Figure[] = [
  ...PEOPLE.map(([x, y, pose, flip], i): Figure => ({ key: `p${i}`, pose, at: [x, 0, y], center: [FOOT_X[pose], 0], flip, standing: true })),
  ...BENCHES.map(([x, y, dir], i): Figure => {
    const pose = SITTERS[i % SITTERS.length]
    const [sx, sy, sz] = seatOf(x, y, dir)
    return { key: `s${i}`, pose, at: [sx, sz * Z_SCALE, sy], center: [SIT_HIP.x / PEEPS[pose].w, 1 - SIT_HIP.y / PEEPS[pose].h], flip: dir === 'x', standing: false }
  }),
]

/**
 * 사람들 (Open Peeps, CC0): 늘 카메라를 보는 납작한 그림(스프라이트)을 땅에 세우고, 발밑에 작은 그림자.
 * SVG 지도와 같은 자리 · 같은 자세 · 같은 크기(37 SVG 단위). 움직이지 않는다.
 * 그림은 처음 한 번 SVG 를 캔버스로 옮겨 만들고, 다 되면 한 장만 다시 그린다.
 */
export const People3D = memo(function People3D({ night }: { night: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  const [tex, setTex] = useState<Partial<Record<PeepId, CanvasTexture>>>({})
  useEffect(() => {
    let alive = true
    const poses = [...new Set(FIGURES.map((f) => f.pose))]
    Promise.all(poses.map((p) => peepTexture(p).then((t) => [p, t] as const)))
      .then((list) => {
        if (!alive) return
        setTex(Object.fromEntries(list))
        invalidate()
      })
      .catch(() => {
        /* 못 만들면 사람 없이 */
      })
    return () => {
      alive = false
    }
  }, [invalidate])
  // 밤: 흰 옷 · 피부가 밤 땅 위에서 튀지 않게 한 단 어둡게
  const tint = night ? '#9aa2ae' : '#ffffff'
  return (
    <group>
      {FIGURES.map((f) => {
        const t = tex[f.pose]
        if (!t) return null
        const art = PEEPS[f.pose]
        const h = (art.h * PEEP_K) / ISO_UNIT
        const w = (art.w * PEEP_K) / ISO_UNIT
        return (
          <group key={f.key}>
            {f.standing && (
              <mesh position={[f.at[0] + 0.03, 0.042, f.at[2] + 0.02]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.7, 1]}>
                <circleGeometry args={[0.13, 20]} />
                <meshBasicMaterial color="#191b1f" transparent opacity={night ? 0.3 : 0.13} depthWrite={false} />
              </mesh>
            )}
            <sprite position={f.at} center={f.center} scale={[f.flip ? -w : w, h, 1]}>
              <spriteMaterial map={t} color={tint} alphaTest={0.35} toneMapped={false} />
            </sprite>
          </group>
        )
      })}
    </group>
  )
})
