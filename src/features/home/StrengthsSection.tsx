import s from './home.module.css'

/** GDGoC DGU 역량: 4기에서 실제로 하는 활동만 적는다 */
const STRENGTHS = [
  { title: 'G-Sprint', body: '실제 배포까지 가는 팀 프로젝트. 12.29 Demo Day 성과공유회', shape: 'circle', color: 'var(--g-red)' },
  { title: 'Core Session', body: '파트별로 돌아가며 여는 기술 세션', shape: 'square', color: 'var(--g-blue)' },
  { title: '연합 행사', body: '동홍동락(DGU × HIU) 교류전, 동지톤 해커톤', shape: 'triangle', color: 'var(--g-yellow)' },
  { title: '파트 4개', body: 'Frontend · Backend · AI/ML · Design', shape: 'pill', color: 'var(--g-green)' },
] as const

export function StrengthsSection() {
  return (
    <section className={s.section} aria-labelledby="strengths-title">
      <div className={s.sectionHead}>
        <h2 id="strengths-title">GDGoC DGU 역량</h2>
      </div>
      <ul className={s.cards4}>
        {STRENGTHS.map((it) => (
          <li key={it.title} className={s.strength}>
            <span className={`${s.shape} ${s[it.shape]}`} style={{ ['--c' as string]: it.color }} aria-hidden="true" />
            <b>{it.title}</b>
            <p>{it.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
