import s from './home.module.css'

/** GDGoC DGU 활동: 4기에서 실제로 하는 활동만 적는다 */
const ACTIVITIES = [
  { title: 'G-Sprint', body: '10월부터 12월까지, 실제 배포까지 가는 팀 프로젝트입니다. 12.29 데모데이(성과공유회)에서 결과를 공유합니다.', shape: 'circle', color: 'var(--g-red)' },
  { title: '정기 세션', body: '화요일에 파트별로 돌아가며 기술 세션을 엽니다.', shape: 'square', color: 'var(--g-blue)' },
  { title: '연합 행사', body: '동홍동락(동국대 × 홍익대 교류전)과 동지톤(연합 해커톤, 2027.01)을 함께 엽니다.', shape: 'triangle', color: 'var(--g-yellow)' },
  { title: '파트 4개', body: '프론트엔드 · 백엔드 · AI/ML · 디자인 파트가 함께 움직입니다.', shape: 'pill', color: 'var(--g-green)' },
] as const

export function ActivitiesSection() {
  return (
    <section className={s.section} aria-labelledby="activities-title">
      <div className={s.sectionHead}>
        <h2 id="activities-title">GDGoC DGU 활동</h2>
      </div>
      <ul className={s.cards4}>
        {ACTIVITIES.map((it) => (
          <li key={it.title} className={s.strength}>
            <span className={`${s.shape} ${s[it.shape]}`} style={{ ['--c' as string]: it.color }} aria-hidden="true" />
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
