# DreamsComeTrue — 프로젝트 컨텍스트

## 세션 시작 시 자동 실행
대화가 시작되면 **즉시** `mcp__serena__activate_project` 도구를 호출하여 Serena 프로젝트를 활성화하세요.
이후 `mcp__serena__prepare_for_new_conversation` 도구를 호출하여 새 대화를 준비하세요.
이 작업은 사용자가 별도로 요청하지 않아도 **항상** 수행해야 합니다.

## 프로젝트 개요
꿈해몽·사주·운세 서비스를 위한 **Android WebView 대상 모바일 웹앱**.

### Frontend (`frontend/`)
- **프레임워크:** Vue 3 (Composition API, `<script setup>`)
- **빌드 도구:** Vite 6 (minify: esbuild)
- **스타일:** Tailwind CSS 3 + scoped CSS (컴포넌트별)
- **상태관리:** Pinia
- **라우팅:** Vue Router 4
- **HTTP:** Axios (`frontend/src/api/index.js`)

### Backend (`backend/`)
- **런타임:** Node.js
- **프레임워크:** Express.js
- **인증:** JWT (`jsonwebtoken`)
- **기타:** cors, dotenv

- **패키지 매니저:** npm (workspaces)

---

## 디렉토리 구조

```
dreamcomtrue/                    ← git root
├── package.json                 ← 루트 (npm workspaces)
├── frontend/                    ← Vue 3 프론트엔드
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js          # Axios 인스턴스 (JWT 인터셉터 포함)
│   │   ├── assets/
│   │   │   └── main.css          # Tailwind 베이스 + 모바일 전역 스타일
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppHeader.vue # 상단 헤더 (로고 + 로그인버튼/알림 아이콘)
│   │   │       ├── AppNavBar.vue # 하단 탭바 (홈/검색/알림/마이페이지)
│   │   │       └── AppFooter.vue # 하단 푸터 (회사정보, 이용약관)
│   │   ├── layouts/
│   │   │   └── MainLayout.vue    # 전체 레이아웃 래퍼
│   │   ├── router/
│   │   │   └── index.js          # 라우트 정의
│   │   ├── stores/
│   │   │   ├── index.js          # 앱 공통 스토어 (로딩 상태)
│   │   │   └── auth.js           # 인증 스토어 (로그인/로그아웃)
│   │   └── views/
│   │       ├── HomeView.vue      # 메인 홈 (꿈해몽/사주/운세 섹션)
│   │       ├── SearchView.vue    # 검색 결과 페이지
│   │       ├── NotifyView.vue    # 알림 페이지 (미구현)
│   │       ├── MyView.vue        # 마이페이지 (로그인/비로그인 분기)
│   │       ├── LoginView.vue     # 로그인 페이지 (독립 레이아웃)
│   │       └── SignupView.vue    # 회원가입 페이지 (2단계 폼 UI 완성, API 미연동)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env
│   └── .env.production
└── backend/                     ← Express.js 백엔드
    ├── src/
    │   ├── index.js              # 서버 진입점 (listen)
    │   ├── app.js                # Express 앱 설정 (미들웨어, 라우트)
    │   ├── routes/
    │   │   └── index.js          # 라우트 통합
    │   ├── controllers/          # 요청 핸들러
    │   ├── middleware/
    │   │   └── auth.js           # JWT 인증 미들웨어
    │   └── models/               # 데이터 모델
    ├── .env                      # 환경 변수 (PORT, JWT_SECRET)
    ├── .env.example
    └── package.json
```

---

## 라우트 구조

```
/login              → LoginView   (MainLayout 없음, 독립 전체화면)
/signup             → SignupView  (MainLayout 없음, 독립 전체화면)
/                   → MainLayout
  ├── /             → HomeView
  ├── /search       → SearchView  (?q=검색어 쿼리 파라미터)
  ├── /notify       → NotifyView
  └── /my           → MyView
```

---

## 레이아웃 구조

```
MainLayout (flex-col, min-height: 100dvh)
├── AppHeader  (sticky top)
├── main.layout-content  (flex: 1, overflow-y: auto)
│   ├── div.content-body (flex: 1) ← RouterView
│   └── AppFooter
└── AppNavBar  (sticky bottom)
```

> `content-body`가 `flex: 1`을 가져 컨텐츠가 짧아도 Footer를 항상 하단으로 밀어냄.

---

## 인증 (Auth)

- **스토어:** `frontend/src/stores/auth.js` — Pinia
- **영속화:** `localStorage` 키 `dct_user` (JSON)
- **상태:** `auth.isLoggedIn` (computed), `auth.user`
- **메서드:** `auth.login(userData)`, `auth.logout()`
- **테스트 계정:** `test@test.com` / `123456` (`LoginView.vue:95` 하드코딩)
- **소셜 로그인:** 카카오·네이버 버튼 UI만 존재, API 미연동

### 헤더 분기
- 비로그인 → `로그인` 버튼 (→ `/login`)
- 로그인 → 🔔 알림 아이콘 (→ `/notify`)

---

## 홈 페이지 섹션 (`HomeView.vue`)

1. **히어로 배너** — 보라색 그라데이션, 오늘 날짜, 꿈해몽 검색창
2. **인기 꿈해몽** — 8개 카드 (임시 데이터), 태그 색상 분류
3. **오늘의 사주풀이** — 4기둥 한자 표시 + 운세 문구 + 재물/애정/건강/직장 점수 바
4. **십이지신 운세** — 12간지 3열 그리드, 순위·별점·생년 표시

### 검색 동작
- 홈 검색창 엔터 → `/search?q=키워드` 라우팅
- `SearchView`는 URL 쿼리 파라미터 `q`를 `onMounted`에서 읽어 자동 검색

---

## 검색 페이지 (`SearchView.vue`)

- **3가지 상태:** 초기(추천/최근 검색어) → 로딩 → 결과/빈 상태
- **최근 검색어:** `localStorage` 키 `dct_recent` (최대 10개)
- **검색 데이터:** 현재 `allDreams` 배열 로컬 필터링 (API 미연동)
- **하이라이트:** 검색어 일치 부분 `<mark>` 태그로 강조

---

## 마이페이지 (`MyView.vue`)

- 로그인 상태: 프로필 아바타 + 메뉴 목록 + 로그아웃 버튼
- 비로그인 상태: 안내 문구 + 로그인 유도 버튼
- 로그아웃: 하단 시트 확인 다이얼로그 → `auth.logout()` → 홈으로 이동

---

## 모바일 WebView 최적화 적용 사항

- `viewport-fit=cover` — 노치/홈바 safe area
- `user-scalable=no` — 핀치 줌 방지
- `overscroll-behavior: none` — 바운스 스크롤 제거
- `-webkit-tap-highlight-color: transparent` — 탭 하이라이트 제거
- `100dvh` — 동적 뷰포트 높이
- `env(safe-area-inset-*)` — NavBar 하단 홈바 여백

---

## 디자인 시스템

- **주 색상:** `#5b21b6` (보라), `#7c3aed` (밝은 보라), `#3b0764` (진한 보라)
- **최대 너비:** `600px` 중앙 정렬 (모바일 + 태블릿 대응)
- **폰트:** 시스템 폰트 (`-apple-system, BlinkMacSystemFont, ...`)
- **border-radius:** 카드 `14~16px`, 버튼 `12~14px`, 아바타/아이콘 `50%`

---

## 개발 명령어

```bash
# 의존성 설치 (루트에서 한 번에)
npm install

# 루트에서 실행 (권장)
npm run dev:frontend    # localhost:5173
npm run dev:backend     # localhost:8080
npm run build           # frontend 프로덕션 빌드

# 각 폴더에서 직접 실행도 가능
cd frontend && npm run dev
cd backend && npm run dev
cd backend && npm run start   # 프로덕션 모드
```

---

## 환경 변수

### Frontend (`frontend/`)
| 파일 | 변수 | 기본값 |
|------|------|--------|
| `frontend/.env` | `VITE_API_BASE_URL` | `http://localhost:8080/api` |
| `frontend/.env.production` | `VITE_API_BASE_URL` | `https://your-api-domain.com/api` |

### Backend (`backend/`)
| 파일 | 변수 | 기본값 |
|------|------|--------|
| `backend/.env` | `PORT` | `8080` |
| `backend/.env` | `JWT_SECRET` | `changeme` |

---

## 작업 로그

### 2026-03-05
- [x] 꿈해몽 검색 API 구현 (백엔드)
  - `backend/src/data/dreams.js` — 인메모리 샘플 5개 (용/돼지/뱀/이빨/물꿈)
  - `backend/src/controllers/dreamsController.js` — `search()`: title+keywords 부분 일치
  - `backend/src/routes/dreams.js` — `GET /api/dreams/search?q=`
  - `backend/src/routes/index.js` — dreams 라우트 등록
- [x] 꿈해몽 검색 API 연동 (프론트엔드, `SearchView.vue`)
  - `allDreams` 로컬 목업 제거 → `api.get('/dreams/search')` 호출로 교체
  - `toCard()` 헬퍼로 응답 필드 매핑 (`interpretation`→`detail`, `category`→`tag`)

---

## 미구현 / 다음 작업 목록

- [ ] 실제 로그인 API 연동 (`LoginView.vue` `onSubmit`)
- [ ] 카카오·네이버 소셜 로그인 연동
- [ ] 알림 페이지 (`NotifyView.vue`) 구현
- [x] 회원가입 페이지 UI 구현 (`SignupView.vue` — 2단계 폼, 유효성 검사, 약관 동의)
- [ ] 회원가입 API 연동 (`SignupView.vue` `onSubmit` — 현재 setTimeout 목업)
- [ ] 꿈해몽 상세 페이지 구현
- [ ] 사주 개인화 (생년월일 입력) → 완료 후 아래 섹션 활성화
- [ ] 십이지신 상세 운세 페이지

---

## 프론트엔드 디자인 TODO

> 2026-03-05 디자인 리뷰 결과 도출. 완료 항목은 `[x]`로 체크 후 작업 로그에 기록.

### 완료
- [x] 커스텀 폰트 도입 — `Noto Serif KR`(제목) + `Noto Sans KR`(본문), `index.html` preconnect + `main.css` 전역 적용
- [x] 히어로 섹션 강화 — 심야 보라 4단 그라데이션, 라디알 글로우, CSS 별 파티클 22개(`twinkle`), 달 SVG 유영 애니메이션, 검색 포커스 링 글로우, 빠른 키워드 칩

### 🔥 High
- [ ] **다크 모드 테마** — 전체 앱에 밤하늘 다크 배경 옵션 추가 (토글 또는 시스템 설정 연동)
- [ ] **카드 디자인 개선** — 꿈해몽·십이지신 카드에 깊이감 있는 그림자, 탭 피드백(active scale), 호버 효과

### 🟡 Mid
- [ ] **페이지 진입 애니메이션** — 카드들이 순차적으로 올라오는 staggered fade-up (`animation-delay`)
- [ ] **십이지신 랭킹 시각화** — 1~3위 카드 금/은/동 테두리 강조 + 크기 차별화
- [ ] **섹션 타이틀 디자인** — 섹션 헤드 레이아웃 강화 (구분선, 이모지 배경, Serif 폰트 적용)

### 🟢 Low
- [ ] **배경 텍스처** — 별자리 선 패턴 또는 CSS 노이즈 그레인 오버레이
- [ ] **NavBar 활성 탭 강화** — 활성 아이콘 아래 점 인디케이터 또는 pill 배경 효과
- [ ] **로그인/회원가입 배경** — 흰 배경 → 미묘한 그라데이션 또는 별 패턴 배경 적용

---

## PoC 비노출 항목

### 오늘의 사주풀이 (`HomeView.vue`)

- **현재 상태:** HTML 주석 처리로 숨김 (`<!-- ... -->`)
- **위치:** `frontend/src/views/HomeView.vue` — "오늘의 사주풀이" 섹션 블록
- **활성화 조건:** 사주 개인화 기능(생년월일 입력) 구현 완료 후 주석 해제
- **관련 데이터:** `sajuPillars`, `todaySaju` (script setup 내 임시 데이터로 보존됨)
