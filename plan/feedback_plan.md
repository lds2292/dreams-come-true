# 꿈해몽 피드백 기능 구현 플랜

## 핵심 목표

- 사용자가 꿈해몽 결과에 만족했는지 수집
- 향후 데이터 기반 품질 개선 (AI 해몽 튜닝, 검색 임계값 조정 등)
- 최소 코드로 시작 → 점진적 확장 가능한 구조

---

## Phase 1 — MVP

### UI: 상세페이지 하단 피드백 섹션

- 위치: `DreamDetailView.vue` 해몽 섹션 하단
- 문구: "이 꿈해몽이 도움이 되셨나요?"
- 버튼: 👍 도움됐어요 / 👎 아쉬워요
- 응답 후: "감사합니다 🙏" 메시지로 교체 (재응답 불가)
- 중복 방지: `localStorage`에 응답한 dreamId 저장, 재방문 시 기존 응답 상태 표시

### 백엔드 API

**`POST /api/dreams/feedback`**

Request body:
```json
{
  "dreamId": "ANIMAL-42",
  "query": "돼지꿈",
  "helpful": true,
  "aiGenerated": false,
  "timestamp": "2026-03-06T12:00:00Z"
}
```

Response:
```json
{ "ok": true }
```

### 데이터 저장

- 파일: `backend/data/feedback.jsonl` (줄 단위 append-only JSON)
- `.gitignore`에 추가하여 실제 사용자 데이터가 커밋되지 않도록 관리
- 나중에 DB로 교체할 때 API 스펙은 그대로 유지

저장 예시:
```
{"dreamId":"ANIMAL-42","query":"돼지꿈","helpful":true,"aiGenerated":false,"ts":"2026-03-06T12:00:00Z"}
{"dreamId":"ai-1741234567","query":"우주여행꿈","helpful":false,"aiGenerated":true,"ts":"2026-03-06T12:05:00Z"}
```

### 추가할 파일

```
backend/
├── src/
│   ├── controllers/
│   │   └── feedbackController.js   ← 신규
│   ├── routes/
│   │   ├── index.js                ← feedback 라우트 등록
│   │   └── feedback.js             ← 신규
│   └── data/
│       └── feedback.jsonl          ← 신규 (gitignore 추가)
frontend/
└── src/views/
    └── DreamDetailView.vue         ← 하단 피드백 섹션 추가
```

---

## Phase 2 — 보강 (이후 단계)

| 항목 | 내용 |
|------|------|
| **세부 피드백** | 어떤 섹션이 도움됐는지 (기본/예지몽/태몽 등) 체크박스 추가 |
| **텍스트 코멘트** | "아쉬운 점을 알려주세요" 선택적 입력 |
| **집계 스크립트** | `feedback.jsonl` → 드림별 만족도 통계 출력 |
| **AI 해몽 개선** | `helpful: false`이고 `aiGenerated: true`인 케이스 분석 → 프롬프트 개선 |
| **관리 페이지** | 어드민용 피드백 목록/통계 뷰 (백오피스) |

---

## 구현 판단 기준

- **지금 바로 구현**: Phase 1 전체 (UI + API + 파일 저장)
- **미루어도 되는 것**: Phase 2 (데이터가 쌓인 후 의미 있음)
- **DB 전환 시점**: 피드백이 1,000건 이상 누적되거나, 실시간 조회가 필요해질 때

---

## Phase 3 — DB 전환 대비

### 전환 전략 원칙

- **API 스펙은 변경하지 않는다**: 라우트(`/api/dreams/feedback`)와 Request/Response 형식을 그대로 유지
- **컨트롤러만 교체**: `feedbackController.js` 내부 저장 로직만 파일 → DB로 변경
- **프론트엔드는 무변경**: API 스펙이 유지되므로 프론트 코드 수정 불필요

```
변경 범위:
  feedbackController.js  ← 저장 로직만 교체
  backend/.env           ← DB 접속 정보 추가
  backend/package.json   ← DB 클라이언트 패키지 추가
```

### 추천 DB 확장 경로

| 단계 | DB | 조건 |
|------|----|------|
| Phase 1 | `feedback.jsonl` (파일) | 초기, 1,000건 미만 |
| Phase 3-A | **SQLite** (`better-sqlite3`) | 빠른 전환, 단일 서버, 수만 건 |
| Phase 3-B | **PostgreSQL** | 다중 서버, 집계 쿼리, 수십만 건 이상 |

> SQLite는 추가 서버 없이 파일 기반으로 동작하므로 중간 단계로 적합.

### DB 스키마 (PostgreSQL 기준)

```sql
CREATE TABLE feedback (
  id           SERIAL PRIMARY KEY,
  dream_id     VARCHAR(64)  NOT NULL,         -- 예: "ANIMAL-42", "ai-1741234567"
  query        VARCHAR(256) NOT NULL,          -- 사용자 검색어
  helpful      BOOLEAN      NOT NULL,          -- true: 도움됨, false: 아쉬움
  ai_generated BOOLEAN      NOT NULL DEFAULT false,
  section      VARCHAR(32)  DEFAULT NULL,      -- Phase 2: 어떤 섹션이 도움됐는지
  comment      TEXT         DEFAULT NULL,      -- Phase 2: 텍스트 코멘트
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 집계 쿼리용 인덱스
CREATE INDEX idx_feedback_dream_id  ON feedback (dream_id);
CREATE INDEX idx_feedback_helpful   ON feedback (helpful);
CREATE INDEX idx_feedback_ai        ON feedback (ai_generated);
```

### 기존 `.jsonl` 데이터 마이그레이션

```js
// backend/scripts/migrate-feedback.js
// feedback.jsonl → DB import 스크립트 (DB 전환 시 1회 실행)
const fs = require('fs');
const lines = fs.readFileSync('data/feedback.jsonl', 'utf-8').trim().split('\n');
for (const line of lines) {
  const row = JSON.parse(line);
  // INSERT INTO feedback (dream_id, query, helpful, ai_generated, created_at)
  // VALUES (row.dreamId, row.query, row.helpful, row.aiGenerated, row.ts)
}
```

### 컨트롤러 교체 예시

```js
// Phase 1: 파일 저장
fs.appendFileSync(FEEDBACK_FILE, JSON.stringify(entry) + '\n');

// Phase 3: DB 저장 (내부만 교체, 함수 시그니처 동일 유지)
await db.query(
  'INSERT INTO feedback (dream_id, query, helpful, ai_generated) VALUES ($1,$2,$3,$4)',
  [entry.dreamId, entry.query, entry.helpful, entry.aiGenerated]
);
```

### 유용한 집계 쿼리 예시 (PostgreSQL)

```sql
-- 전체 만족도
SELECT helpful, COUNT(*) FROM feedback GROUP BY helpful;

-- AI 해몽 vs 일반 해몽 만족도 비교
SELECT ai_generated, helpful, COUNT(*)
FROM feedback
GROUP BY ai_generated, helpful;

-- 만족도 낮은 검색어 Top 10
SELECT query, COUNT(*) AS cnt
FROM feedback
WHERE helpful = false
GROUP BY query
ORDER BY cnt DESC
LIMIT 10;
```
