# GDGoC DGU 홈페이지 프로토타입

Google Developer Groups on Campus Dongguk University 홈페이지를 React로 만든 시안 레포입니다.
4기 G-Sprint 팀 본 레포가 아닙니다. 폴더 구조와 패턴은 **제안**이고, 실제 규칙은 팀(FE 이도윤 · 박정은)이 정합니다.

- 메뉴: 배범서 기획(노션 '기획 구체화')의 Home · Projects · Teams · Community · Recruits 를 한글로 표기 (홈 · 프로젝트 · 팀원 모집 · 커뮤니티 · 지원 안내). 주소는 영어 그대로 (/projects …)
- 첫 화면: 한 줄 소개 + 다음 일정, 그 아래 화면 끝까지 닿는 캠퍼스 지도. 건물 하나가 메뉴 하나입니다 (지도 = 메뉴)
- 디자인: [docs/DESIGN.md](docs/DESIGN.md) '캠퍼스 안내판'. 흰 종이 + 먹색 글자, 장소색은 '어디'에만, 주황은 '지금 기수'에만
- 내용: 지어낸 숫자 · 후기 · 사진 없이 **실제 기록**만 씁니다 (gdg.community.dev 행사, GitHub GDSC-DGU 프로젝트, 4기 일정). [docs/CONTENT.md](docs/CONTENT.md)
- 문구: 되도록 한글. 이름(GDGoC DGU, G-Sprint, 행사 정식 명칭)과 기술 이름만 영어

## 실행

Node.js 20.19 이상이 필요합니다.

```bash
npm install
npm run dev          # http://localhost:5173  (/api 는 localhost:8080 으로 넘김)
npm test             # 순수 로직 · 내용 검사 · 서버 응답 변환 테스트 (vitest)
npm run lint         # oxlint
npm run build        # 타입 검사 + 배포용 빌드 (dist/)
npm run sync:events  # gdg.community.dev 행사 목록을 src/content/events.json 에 반영 (운영진이 직접 실행)
```

## 화면

| 주소 | 내용 |
|---|---|
| `/` | 한 줄 소개 · 다음 일정 → 지도 + 범례(누르면 장소 미리보기) → 지금 4기는(학기 줄 · 다가오는 일정 · 달력) → 활동 → 기록(1–4기) → 프로젝트 → 5기 모집 · 자주 묻는 질문 |
| `/projects` | 진행 중인 4기 G-Sprint 단계 + 지난 프로젝트 23개 (연도 · 프로그램별) |
| `/community` | 다가오는 일정 + 지난 행사 45건 (기수 · 종류로 거르기, 행사 페이지로 연결) |
| `/recruits` | 5기 모집 상태, 지난 4기 모집 과정, 지원 자격 · 세션 시간, 자주 묻는 질문 |
| `/teams` `/admin` | 준비 중 페이지 (무엇이 들어올지 · 어디에 먼저 알릴지) |

- 검색: 머리말 돋보기 또는 `⌘K` / `Ctrl+K`. 행사 · 프로젝트 · 자주 묻는 질문을 같이 찾습니다.
- 팀 기획 메모(들어갈 기능, 정할 것, 와이어프레임 번호)는 `npm run dev` 에서만 보입니다. 배포본에서 보려면 `VITE_SHOW_PLAN=true`.

## 폴더 구조

```
src/
  content/       실제 기록 JSON (행사 · 프로젝트 · 기수 · FAQ · 챕터 · 모집) + 검사(validate.ts)
  config/        사이트 설정. 장소(=메뉴), 문구 · 링크, G-Sprint 단계, 준비 중 페이지 계획
  domain/        데이터 모양 (types.ts)
  data/          데이터 창구(Repository) + 서버 데이터 훅(queries.ts, TanStack Query)
    snapshot/    기본 구현: src/content JSON 을 읽는다
    http/        Spring Boot 구현 + 응답 변환(adapters.ts) + 테스트
    mock/        테스트용 예시 데이터
  services/      검색 (키워드 + 같은 뜻 낱말. 나중에 서버 → Gemini 로 교체 가능)
  state/         지도 · 범례 · 검색이 같이 보는 상태 (useReducer + Context)
  lib/           화면과 상관없는 계산 (날짜, 일정, 학기 줄, 아이소메트릭, 장면 맞추기). 테스트 있음
  hooks/         여러 곳에서 쓰는 훅
  features/
    campus/      지도 (건물, 지붕, 깃발, 안내판, 나무, 걷는 사람)
    home/        홈 섹션들 + 장소 미리보기(PlacePopover)
    now/         '지금 4기는' (학기 줄, 다가오는 일정, 달력)
    layout/      머리말 · 꼬리말 · 검색 창 · 폰 메뉴
    pages/       프로젝트 · 커뮤니티 · 지원 안내 · 준비 중 · 오류 페이지
  app/           주소와 페이지 연결 (홈 말고는 들어갈 때 받는다)
scripts/sync-events.mjs   행사 목록 갱신
docs/DESIGN.md            디자인 원칙 (먼저 읽기)
docs/CONTENT.md           내용을 고치는 법 · 출처 규칙
docs/ARCHITECTURE.md      왜 이렇게 나눴는지
```

## 자주 하는 일

| 하고 싶은 것 | 고칠 곳 |
|---|---|
| 행사 추가 · 수정 | `npm run sync:events` 또는 `src/content/events.json` (출처 주소 필수, [CONTENT.md](docs/CONTENT.md)) |
| 프로젝트 추가 | `src/content/projects.json` (GitHub GDSC-DGU 저장소 기준) |
| 5기 모집 일정이 정해지면 | `src/content/recruiting.json` 의 `current` |
| 멤버 수 · 연락처 · 데모데이 | `src/content/chapter.json` |
| 장소 이름 · 설명 · 색 | `src/config/places.ts` |
| 소개 문구 · 링크 | `src/config/site.ts` (null 이면 화면에서 숨김) |
| 새 지붕 모양 | `features/campus/roofs/` 에 컴포넌트 추가 → `roofs/index.ts` 와 `roofs/heights.ts` 에 등록 |
| Spring Boot API 붙이기 | `.env.local` 에 `VITE_DATA_SOURCE=http` → 주소는 `data/http/httpRepositories.ts`, 응답 모양 차이는 `data/http/adapters.ts` 에서 맞춤 |
| 준비 중 페이지를 실제로 만들기 | `features/pages/` 에 새 페이지 → `app/lazyPages.tsx` 와 `app/router.tsx` 의 `BUILT_ROUTES` 에 추가 → `config/pages.ts` 에서 계획 지우기 |

## 실제 정보가 필요한 것

화면에 지어낸 정보를 넣지 않으려고 비워 둔 자리입니다.

- 공식 로고 SVG (`features/layout/BrandMark.tsx` 자리 표시)
- 활동 사진 (챕터 드라이브 `01_4기/마케팅/행사 사진` 이 아직 비어 있음)
- 5기 모집 일정 · 선발 절차
- 4기 운영 계획 날짜(휴회 주, MT, 동지톤 등)는 팀 계획 기준이라 공개 행사 페이지가 올라오면 맞춰 봐야 합니다

## 팀에서 정할 것

이 레포의 구조는 하나의 제안입니다. G-Sprint FE 결정 사항과 맞춰 보세요.

- 폴더 구조 (기능별 `features/` 로 나눌지)
- 서버 데이터 관리: 지금은 TanStack Query (`data/queries.ts`). 같은 데이터를 여러 곳에서 써도 한 번만 부름
- 내용 관리: 지금은 저장소 JSON + 검사 테스트. 운영진이 글을 올리게 되면 관리자 페이지 + API 로 옮김
- 스타일 방식: 지금은 CSS Modules + 디자인 토큰(`styles/tokens.css`)
- CI/CD: 노션에 'GitHub Actions + Vercel' 메모가 있지만, 정해 둔 스택은 Firebase Hosting 입니다. 하나로 정리가 필요합니다
