# 콘텐츠 고치기 (운영진용)

사이트에 나오는 행사 · 프로젝트 · 기수 연혁 · 자주 묻는 질문은 모두 `src/content/` 의 JSON 파일에서 옵니다.
화면 코드는 고칠 필요가 없습니다. JSON 을 고치고 테스트를 돌린 뒤 올리면 됩니다.

## 1. 가장 중요한 규칙: 출처

- **모든 줄에 `source` 를 적습니다.** 공개 페이지 주소(https://…)이거나, 아직 공개 페이지가 없는 내부 계획이면 그 이름(`4기 운영 계획`)입니다.
- 직접 열어 본 공개 페이지에 있는 사실만 씁니다. 기억이나 '아마 그랬을 것'은 넣지 않습니다. 확인이 안 되면 빼 둡니다.
- 숫자에는 기준을 붙입니다 (`gdg.community.dev 기준 2026.10`).
- 모르면 비워 둡니다. 화면은 빈 칸을 숨기도록 만들어져 있습니다.
- 지어낸 예시 글(모집 글 · 후기 등)은 넣지 않습니다. 아직 열지 않은 게시판은 날짜 없는 상태 줄(`TEAMS_STATUS`)로 보여 줍니다.

## 1-1. 문구 쓰는 법 (content.test.ts 가 검사)

- **조사는 붙여 씁니다**: `G-Sprint는`, `Camping Seminar를`, `TTS로`, `AI가`, `gdsc.dgu@gmail.com이나`, `@gdg.donggukuniv로`.
- **화면에 보이는 날짜는 점으로** 씁니다: `2026.08.18`, `2026.09.08–09.10`. `2026-08-18` 모양은 `date` · `start` 같은 날짜 필드에만 씁니다.
- **한 가지를 한 이름으로**: `Google 기술`(구글 X), `코어 멤버`(Core Member X), `Solution Challenge 2024`, `Solution Challenge 2025 APAC`, `동국대 Dev Conference 2025`, 10.13 은 `킥오프`.
- 기수 연혁의 숫자는 센 만큼만: `Camping Seminar 공개 기록 8건`(events.json 의 그 기수 · 시리즈 줄 수), `SDGs Project 4개`(projects.json 의 그 기수 · 프로그램 줄 수).

## 2. 파일별 안내

| 파일 | 내용 | 주로 고치는 때 |
|---|---|---|
| `events.json` | 지난 행사 + 다가오는 일정 | 행사가 끝났을 때, 새 일정이 정해졌을 때 (`sync-events` 로 자동) |
| `projects.json` | 프로젝트 목록 | 데모데이 뒤, GitHub 저장소가 생겼을 때 |
| `generations.json` | 기수 연혁 (1기 ~ 지금) | 기수가 바뀔 때 |
| `faq.json` | 자주 묻는 질문 | 모집 전 |
| `recruiting.json` | 지금 모집 상태 · 지난 모집 기록 | 모집 공지를 올릴 때 |
| `chapter.json` | 멤버 수, 오거나이저, 이메일, G-Sprint 숫자 | 학기마다 |

파일마다 맨 위에 `updatedAt` 이 있습니다. 고친 날짜(YYYY-MM-DD)로 바꿔 주세요. `events.json` 의 날짜는 사이트 아래쪽 '갱신' 표시에도 쓰입니다.

### events.json

한 줄에 행사 하나, **날짜순**으로 씁니다.

| 필드 | 뜻 | 예 |
|---|---|---|
| `id` | 바뀌지 않는 이름 (영어 소문자 · 숫자 · `-`) | `3rd-camping-12` |
| `date` | 한국 날짜 | `2026-03-20` |
| `endDate` | 여러 날 행사의 마지막 날 (하루면 안 씀) | `2027-01-31` |
| `title` | 화면에 보이는 짧은 한글 제목 | `Camping Seminar 12회`, `2기 데모데이` |
| `originalTitle` | 게시된 원래 제목 그대로 | `GDG on Campus DGU 12th Camping Seminar` |
| `kind` | 종류 (아래 표) | `session` |
| `place` | 눌렀을 때 열 장소 (아래 표) | `community` |
| `generation` | 몇 기 활동인지 (9월 시작 학년 기준) | `3` |
| `series` | 이어지는 행사 이름 | `Camping Seminar` |
| `venue` | 장소 (건물 + 호실) | `정보문화관 P404` |
| `url` | 자세히 보기 주소 | gdg.community.dev 행사 상세 페이지 |
| `source` | 출처 | 상세 페이지 주소 또는 `4기 운영 계획` |

| kind | 언제 | place |
|---|---|---|
| `recruit` | 모집 · OT | `recruits` |
| `session` | 세미나 · 스터디 · 파트 세션 | `community` |
| `event` | 연합 행사 · 컨퍼런스 · 피크닉 · 해커톤 | `community` (팀원 모집 게시판을 열기 전까지는 해커톤도 여기) |
| `sprint` | G-Sprint 단계 (킥오프 · 중간 발표 · 데모데이) | `projects` |
| `project` | G-Sprint 밖 프로젝트 발표 · 데모데이 | `projects` |
| `notice` | 공지 | 알맞은 곳 |
| `rest` | 휴회 (시험 기간) | `community` |

제목 쓰는 법

- 이름은 영어 그대로 둡니다 (Camping Seminar, Open Seminar, Alumni Seminar, Solution Challenge).
- 회차는 게시된 제목의 숫자를 그대로 따릅니다. 2기 제목은 `2st · 3st …` 처럼 적혀 있지만 `2회 · 3회` 로 씁니다. 원래 제목은 `originalTitle` 에 남깁니다.
- Demo Day 는 한글 제목에서 `데모데이` 로 씁니다.
- 운영 계획 일정은 공개 페이지가 생기면 `url` · `source` 를 그 주소로 바꿉니다 (`sync-events` 가 같은 날 · 같은 장소면 자동으로 합칩니다).

### projects.json

| 필드 | 뜻 |
|---|---|
| `id` | 바뀌지 않는 이름 |
| `name` | 프로젝트 이름 (README 의 이름) |
| `summary` | 짧은 ~습니다체 한두 문장. **README 에 있는 내용만.** README 에 설명이 없으면 비웁니다 |
| `program` | 어떤 프로그램에서 만들었는지 (`Solution Challenge 2024`, `Solution Challenge 2025 APAC`, `SDGs Project`, `G-Sprint` …) |
| `year` | 연도 |
| `generation` | 몇 기 (아래 규칙) |
| `stack` | 기술 4개까지 (README 나 GitHub 언어 표시 기준) |
| `repo` | GitHub GDSC-DGU 저장소 (팀 저장소가 여럿이면 대표 하나). 개인 저장소 주소는 적지 않습니다 |
| `url` | 실제로 열리는 서비스 주소만 (웹 · 스토어). 시연 영상 · APK 파일 링크는 넣지 않습니다 |
| `status` | `done` 또는 `in-progress` |
| `source` | 확인한 저장소 주소 (또는 `4기 G-Sprint`) |

끝난 프로젝트는 `repo` 나 `url` 중 하나가 꼭 있어야 합니다. 진행 중인 프로젝트는 공개 주소가 없으면 비워 둡니다 (예: 개인 저장소에서 만드는 홈페이지 리뉴얼).
빈 저장소(README · 파일 없음)는 넣지 않습니다.

**공개 프로젝트 숫자**는 `src/content/index.ts` 의 도우미로 셉니다. 화면에서 직접 거르지 마세요.

| 이름 | 뜻 |
|---|---|
| `PUBLIC_PROJECTS` | `repo` 가 `https://github.com/GDSC-DGU/` 아래인 프로젝트 (진행 중 · 개인 저장소 제외) |
| `isPublicProject(p)` | 같은 기준의 판별 함수 (서버에서 받은 목록을 셀 때) |
| `projectsBasis` | 숫자 옆 기준 문구 `GitHub GDSC-DGU 기준` |

**기수 정하는 규칙**: 프로그램이 열린 시기로 정합니다. 학년은 9월에 시작합니다 (2기 = 2024.09 ~ 2025.08).

| 프로그램 | 시기 | 기수 |
|---|---|---|
| Solution Challenge 2024 (`2024-SolutionChallenge-*`) | 2024년 상반기 | 1기 (GDSC) |
| GDSC DGU 웹사이트 (`gdsc-dgu`, README 2024.03) | 2024년 3월 | 1기 |
| Solution Challenge 2025 APAC (`2025-APAC-SolutionChallenge-*`) | 2025년 상반기 | 2기 |
| 2025 동국대 봄 축제 웹사이트 (`DGU-2025-Festival-*`) | 2025년 봄 | 2기 |
| SDGs Project (`2026-SDGs-Project-*`) | 2026년 상반기 | 3기 |
| G-Sprint (홈페이지 리뉴얼) | 2026년 가을 | 4기 |

`GDGoC-DGU-Website` 는 마지막 수정이 2025.09 라는 것만 확인돼서 기수를 비워 두었습니다.

### generations.json

| 필드 | 뜻 |
|---|---|
| `n` | 기수 번호. 1부터 빠짐없이 |
| `name` | 그때 이름. 1기 `GDSC DGU` (GitHub 저장소가 'GDSC Solution Challenge'), 2기부터 `GDGoC DGU` (gdg.community.dev 2기 행사가 'GDG on Campus DGU') |
| `start` | 첫 공개 행사(OT)가 있던 달 `YYYY-MM`. 공개 기록이 없으면 비움 (1기) |
| `end` | 마지막으로 확인된 공개 행사의 달. 지금 기수는 비움 |
| `summary` | 한 줄 (~습니다체) |
| `highlights` | 대표 기록 2~4개. events · projects 에 있는 것만 |
| `current` | 지금 기수에만 `true` (딱 하나) |
| `source` | 출처 주소 목록 |

새 기수가 시작되면: 이전 기수의 `current` 를 지우고 `end` 를 채운 뒤, 새 기수를 맨 아래에 `current: true` 로 더합니다.

### faq.json

`id`, `q`(물음표로 끝남), `a`(짧은 ~습니다체, `니다.` 로 끝남), `source`. 5~7개가 알맞습니다.
지원 자격 · 정기 모임 시간은 Linktree 의 4기 일반 멤버 지원서(`https://forms.gle/LmwqYrdkyrtuvAmX6`, 마감 뒤에도 안내문이 열림) 기준입니다. 시험 기간 휴회는 4기 운영 계획 기준입니다.

### recruiting.json

`history[].steps` 는 시작한 날 순서로 씁니다. 한 단계: `id`, `label`(한글, 예: `마케팅 코어 모집`), `start`, `end`(여러 날이면), `source`, `note`(선택, 예: `면접 2026.09.11 · 최종 발표 2026.09.12`).

## 3. 확인하기

```bash
npx vitest run src/content          # 콘텐츠 검사만 (몇 초)
npm test                            # 전체
```

검사하는 것: id 중복, 날짜 모양(없는 날짜 포함), `endDate ≥ date`, 날짜순, 모든 줄의 출처, 기수와 날짜가 맞는지,
종류와 장소가 맞는지, 기수 1..N 연속 · 지금 기수 하나, 끝난 프로젝트의 repo/url, 기술 4개 이하, FAQ 말투,
조사 띄어쓰기 · 날짜 표기 · 한 이름 규칙(1-1), 연혁 숫자와 실제 줄 수, 공개 프로젝트 기준, 예시 글이 없는지.
틀린 줄은 화면에서 빠지고, 테스트가 `파일 · 몇 번째 줄 · 무엇이 틀렸는지` 를 보여 줍니다.

## 4. gdg.community.dev 행사 받아오기

`scripts/sync-events.mjs` 가 챕터 페이지의 지난 행사 · 다가오는 행사를 받아 `events.json` 에 합칩니다 (Node 20 이상, 운영진 컴퓨터나 CI 에서).

`package.json` 의 `scripts` 에 한 줄을 더해 두면 편합니다.

```json
"sync:events": "node scripts/sync-events.mjs"
```

```bash
npm run sync:events -- --dry-run   # 무엇이 바뀌는지만 보기 (파일 그대로)
npm run sync:events                # events.json 고치기
npm run sync:events -- --prune     # 챕터 페이지에서 사라진 행사도 지우기
npx vitest run src/content         # 받은 뒤 꼭 검사
```

합치는 규칙

1. 출처가 gdg.community.dev 가 아닌 줄(`4기 운영 계획` 등)은 그대로 둡니다.
2. 이미 있는 행사(같은 상세 페이지 주소)는 사람이 다듬은 값(id · 한글 제목 · 종류 · 장소 · 기수 · 시리즈 · 장소명)을 지키고, 날짜와 원래 제목만 새로 받습니다.
3. 운영 계획 일정과 같은 날 · 같은 장소인 공개 행사가 생기면 한 줄로 합칩니다 (id · 한글 제목은 계획 쪽, 주소 · 출처는 공개 페이지).
4. 새 행사는 제목으로 종류 · 장소를 어림하고, 기수는 날짜로 정합니다. **받은 뒤 새 줄의 `title` · `kind` · `place` · `venue` 를 한 번 확인해 주세요.**
   스크립트는 해커톤을 아직 `teams` 로 어림합니다. `community` 로 고쳐 주세요. 같은 이유로 운영 계획의 `동지톤`(community)과 공개 페이지(teams)가 자동으로 합쳐지지 않을 수 있으니, 두 줄이 생기면 한 줄로 합쳐 주세요.
5. 응답에 없는 공개 행사는 기본으로 남깁니다 (다른 챕터가 연 공동 행사 등). 지우려면 `--prune`.

주의: gdg.community.dev 의 `/api/` 는 검색 로봇에게 막혀 있는 주소라, 사람이 직접 돌리는 이 스크립트에서만 씁니다. 사이트(브라우저)는 이 주소를 부르지 않고 저장소의 JSON 만 읽습니다.

## 5. 지금 스냅샷 (2026-10-17 확인)

- 행사: 2기 17개 · 3기 24개 · 4기 13개 (지난 4개 + 운영 계획 9개). 모두 gdg.community.dev 행사 상세 페이지를 열어 확인했습니다.
- 프로젝트: 24개 = 공개 23개(GitHub GDSC-DGU 저장소 README 확인) + 진행 중 1개(홈페이지 리뉴얼, 개인 저장소라 주소 없음).
- 빈 저장소라 뺀 것: `2026-SDGs-Project-healthgotchi` (2026.10.17 확인).
- 확인하지 못해 뺀 것: 2기 2024-09-26 OT · 2024-11-21 Open Seminar · 2024-11-28 Bonfire, 3기 2025-11-28 Bonfire · 2026-01-29 건국대 · 동국대 · 숙명여대 Inter-Chapter Session · 2026-02-06~07 GDGoC 연합해커톤 ONE WAVE(동국대 참여 여부) · 2026-05-08 한강 피크닉 · 2026-05-29 SDGs 중간발표 · 2026-06-26 3기 데모데이 · 수료식.
  상세 페이지 주소를 찾으면 그 주소를 `url` · `source` 로 적어 더해 주세요.
- 프로그램을 확인하지 못해 뺀 저장소: `ecofont`, `artrun-be`, `heart-signal`.
