# GDGoC DGU 홈페이지 프로토타입

Google Developer Groups on Campus Dongguk University 홈페이지의 **첫 화면 시안**을 React로 만든 연습용 레포입니다.
4th G-Sprint 팀 본 레포가 아닙니다. 폴더 구조와 패턴은 **제안**이고, 실제 규칙은 팀(FE 이도윤 · 박정은)이 정합니다.

- 메뉴: 배범서 기획(노션 '기획 구체화')의 Home · Projects · Teams · Community · Recruits
- 첫 화면: 움직이는 캠퍼스 지도. 건물 하나가 메뉴 하나입니다 (지도 = 메뉴)
- 디자인: GDGoC DGU 디자인 시스템 (흰 바탕, 구글 4색은 도형에만, 4th 표시만 주황)

## 실행

Node.js 20.19 이상이 필요합니다.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 순수 로직 테스트 (vitest)
npm run lint     # oxlint
npm run build    # 타입 검사 + 배포용 빌드 (dist/)
```

## 화면

| 주소 | 내용 |
|---|---|
| `/` | 지도 + 카드(한눈에 보기, 장소 미리보기, 다가오는 일정, G-Sprint 진행) + 소개 · 역량 · 멤버 후기 · 캘린더 · 모집 |
| `/projects` `/teams` `/community` `/recruits` | 준비 중 페이지. 들어갈 기능과 와이어프레임 번호(02~05), 최근 글 미리보기 |
| `/admin` | 준비 중. 관리자 화면 계획(06~07) |

화면에 `예시` 표시가 붙은 숫자와 글은 실제 값이 아직 없어서 넣은 예시입니다. 일정과 행사 이름은 4기 실제 일정입니다.

## 폴더 구조

```
src/
  config/        사이트 설정. 장소(=메뉴), 문구, G-Sprint 일정, 준비 중 페이지 계획
  domain/        데이터 모양 (types.ts)
  data/          데이터 창구(Repository). mock/ 예시 구현, http/ Spring Boot 구현 자리
  services/      검색 같은 교체 가능한 기능 (지금: 키워드, 나중: Gemini)
  state/         지도 · 메뉴 · 패널이 같이 보는 상태 (useReducer + Context)
  lib/           화면과 상관없는 계산 (날짜, 아이소메트릭, 장면 맞추기). 테스트 있음
  hooks/         여러 곳에서 쓰는 훅
  features/
    campus/      지도 (건물, 지붕, 깃발, 나무, 이름표, 걷는 사람)
    hud/         지도 위 카드들
    home/        홈 페이지 구성
    layout/      머리말 · 꼬리말 · 페이지 틀
    pages/       준비 중 페이지
  app/router.tsx 주소와 페이지 연결
docs/ARCHITECTURE.md  왜 이렇게 나눴는지
```

## 자주 하는 일

| 하고 싶은 것 | 고칠 곳 |
|---|---|
| 장소 이름 · 설명 · 색 바꾸기, 장소 추가 | `src/config/places.ts` 한 곳 |
| 새 지붕 모양 | `features/campus/roofs/` 에 컴포넌트 추가 → `roofs/index.ts` 와 `roofs/heights.ts` 에 등록 |
| 일정 · 숫자 · 미리보기 글 바꾸기 | 지금은 `data/mock/fixtures.ts`, 서버가 생기면 API |
| Spring Boot API 붙이기 | `.env` 에 `VITE_DATA_SOURCE=http` → `data/http/httpRepositories.ts` 의 주소를 API 명세서에 맞추기 |
| 검색을 Gemini로 | 서버의 `/api/search` 가 Gemini API 를 부르게 만들기. Gemini 키는 브라우저에 두지 않음 |
| 준비 중 페이지를 실제로 만들기 | `features/pages/` 에 새 페이지 → `app/router.tsx` 에서 바꿔 끼우기 → `config/pages.ts` 에서 계획 지우기 |

## 팀에서 정할 것

이 레포의 구조는 하나의 제안입니다. G-Sprint 첫 주 FE 결정 사항과 맞춰 보세요.

- 폴더 구조 (기능별 `features/` 로 나눌지)
- 서버 데이터 관리: 지금은 작은 `useAsync` 훅. TanStack Query 로 바꾸면 `useAsync(key, fn)` 자리만 바뀝니다
- API 호출 위치: 지금은 `data/` 의 Repository 한 곳
- 스타일 방식: 지금은 CSS Modules + 디자인 토큰(`styles/tokens.css`)
- CI/CD: 노션에 'GitHub Actions + Vercel' 메모가 있지만, 정해 둔 스택은 Firebase Hosting 입니다. 하나로 정리가 필요합니다
