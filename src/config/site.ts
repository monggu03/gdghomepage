/** 사이트 공통 문구와 링크. 실제 주소가 정해지면 여기만 바꾼다. */
export const SITE = {
  shortName: 'GDGoC DGU',
  fullName: 'Google Developer Groups on Campus Dongguk University',
  generation: '4th',
  generationYears: '2026–27',
  /** 아직 정해지지 않은 링크는 null 로 두고 화면에서 '준비 중'으로 보여준다 */
  links: {
    email: null as string | null,
    contact: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
    github: null as string | null,
  },
} as const

/** 4기 G-Sprint 일정 (확정) */
export const SPRINT = {
  title: 'G-Sprint',
  demoDay: '2026-12-29',
  steps: [
    { label: '발제', when: '09.22', date: '2026-09-22' },
    { label: '팀빌딩', when: '10.06', date: '2026-10-06' },
    { label: '주제 발표', when: '10.13', date: '2026-10-13' },
    { label: '중간 발표', when: '10.27', date: '2026-10-27' },
    { label: '개발', when: '11월', date: '2026-11-03' },
    { label: 'Demo Day', when: '12.29', date: '2026-12-29', note: '성과공유회' },
  ],
} as const
