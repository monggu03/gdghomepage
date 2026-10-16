# GDGoC DGU 홈페이지 프로토타입

Google Developer Groups on Campus Dongguk University 홈페이지의 **첫 화면 시안**을 React로 만든 연습용 레포입니다.
4th G-Sprint 팀 본 레포가 아닙니다. 폴더 구조와 패턴은 **제안**이고, 실제 규칙은 팀(FE 이도윤 · 박정은)이 정합니다.

- 메뉴: 배범서 기획(노션 '기획 구체화')의 Home · Projects · Teams · Community · Recruits 를 한글로 표기 (홈 · 프로젝트 · 팀원 모집 · 커뮤니티 · 지원 안내). 주소는 영어 그대로 (/projects …)
- 첫 화면: 소개 글 + 움직이는 캠퍼스 지도. 건물 하나가 메뉴 하나입니다 (지도 = 메뉴)
- 디자인: GDGoC DGU 디자인 시스템 (흰 바탕, 구글 4색은 도형에만, 기수 표시만 주황)
- 문구: 되도록 한글. 이름(GDGoC DGU, G-Sprint, Core Session 같은 행사 이름, 정식 명칭)과 기술 이름만 영어

## 실행

Node.js 20.19 이상이 필요합니다.

```bash
npm install
npm run dev      # http://localhost:5173  (/api 는 localhost:8080 으로 넘김)
npm test         # 순수 로직 · 서버 응답 변환 테스트 (vitest)
npm run lint     # oxlint
npm run build    # 타입 검사 + 배포용 빌드 (dist/)
```

## 화면

| 주소 | 내용 |
|---|---|
| `/` | 소개 글(h1) + 지도 + 카드(장소 미리보기, 다가오는 일정, G-Sprint 진행) → 소개 · 활동 · 멤버 후기 · 캘린더 · 모집 |
| `/projects` `/teams` `/community` | 준비 중 페이지. 한 줄 설명 + 최근 글 |
| `/recruits` | 지원 안내(지난 모집 시기, 정기 세션, 5기 공지 예정) + 인스타그램 |
| `/admin` | 준비 중 (운영진 로그인 자리) |

- `예시` 표시(점선)는 화면 모양을 보여주려고 넣은 글입니다. `예정` 표시(파란 바탕)는 실제 일정입니다.
- 일정과 행사 이름은 4기 실제 일정입니다. 지난 기수 활동처럼 읽힐 수 있는 예시는 넣지 않습니다.
- 팀 기획 메모(들어갈 기능, 정할 것, 와이어프레임 번호)는 `npm run dev` 에서만 보입니다. 배포본에서 보려면 `VITE_SHOW_PLAN=true`.

## 폴더 구조

```
src/
  config/        사이트 설정. 장소(=메뉴), 문구 · 링크, G-Sprint 일정, 준비 중 페이지 계획
  domain/        데이터 모양 (types.ts)
  data/          데이터 창구(Repository) + 서버 데이터 훅(queries.ts, TanStack Query)
    mock/        예시 데이터 구현
    http/        Spring Boot 구현 + 응답 변환(adapters.ts) + 테스트
  services/      검색 같은 교체 가능한 기능 (지금: 키워드, 나중: 서버 → Gemini)
  state/         지도 · 메뉴 · 패널이 같이 보는 상태 (useReducer + Context)
  lib/           화면과 상관없는 계산 (날짜, 일정, 아이소메트릭, 장면 맞추기). 테스트 있음
  hooks/         여러 곳에서 쓰는 훅
  features/
    campus/      지도 (건물, 지붕, 깃발, 나무, 이름표, 걷는 사람)
    hud/         지도 위 카드들
    home/        홈 페이지 구성
    layout/      머리말 · 꼬리말 · 페이지 틀
    pages/       준비 중 페이지, 오류 페이지
  app/router.tsx 주소와 페이지 연결
docs/ARCHITECTURE.md  왜 이렇게 나눴는지
```

## 자주 하는 일

| 하고 싶은 것 | 고칠 곳 |
|---|---|
| 장소 이름 · 설명 · 색 바꾸기 | `src/config/places.ts` |
| 장소(메뉴) 추가 | `domain/types.ts` 의 `PlaceId` 에 이름 → `config/places.ts` 에 한 줄 → `config/pages.ts` 에 페이지 계획 (주소는 자동 연결) → 예시 데이터를 쓰면 `data/mock/fixtures.ts` 의 `PREVIEWS` |
| 링크 · 연락처 · 소개 문구 | `src/config/site.ts` (null 이면 화면에서 숨김) |
| 새 지붕 모양 | `features/campus/roofs/` 에 컴포넌트 추가 → `roofs/index.ts` 와 `roofs/heights.ts` 에 등록 |
| 일정 · 미리보기 글 · 숫자 | 지금은 `data/mock/fixtures.ts`, 서버가 생기면 API |
| Spring Boot API 붙이기 | `.env.local` 에 `VITE_DATA_SOURCE=http` → 주소는 `data/http/httpRepositories.ts`, 응답 모양 차이는 `data/http/adapters.ts` 에서 맞춤 |
| 검색을 Gemini로 | 서버의 `/api/search` 가 Gemini API 를 부르게 만들기. Gemini 키는 브라우저에 두지 않음 |
| 준비 중 페이지를 실제로 만들기 | `features/` 에 새 페이지 → `app/router.tsx` 의 `BUILT_ROUTES` 에 추가 → `config/pages.ts` 에서 계획 지우기 |

## 실제 정보가 필요한 것

화면에 지어낸 정보를 넣지 않으려고 비워 둔 자리입니다. 정해지면 `config/site.ts` 나 API 로 채웁니다.

- 5기 모집: 일정, 지원 자격(학년 · 전공), 선발 절차, 지원 방법(구글 폼인지 직접인지)
- 연락처: 공식 이메일, LinkedIn, GitHub (지금은 인스타그램 · Linktree 만 확인됨)
- 숫자: 누적 멤버 · 프로젝트 수 (있으면 첫 화면에 한 줄로 나옴)
- 기수 연혁(1st~4th, 시작 연도)과 운영진 소개
- 활동 사진 (챕터 드라이브 `01_4기/마케팅/행사 사진`)
- 멤버 후기 (멤버가 직접 쓴 글)

## 팀에서 정할 것

이 레포의 구조는 하나의 제안입니다. G-Sprint 첫 주 FE 결정 사항과 맞춰 보세요.

- 폴더 구조 (기능별 `features/` 로 나눌지)
- 서버 데이터 관리: 지금은 TanStack Query (`data/queries.ts`). 같은 데이터를 여러 곳에서 써도 한 번만 부름
- API 호출 위치: 지금은 `data/` 의 Repository 한 곳
- 스타일 방식: 지금은 CSS Modules + 디자인 토큰(`styles/tokens.css`)
- CI/CD: 노션에 'GitHub Actions + Vercel' 메모가 있지만, 정해 둔 스택은 Firebase Hosting 입니다. 하나로 정리가 필요합니다
