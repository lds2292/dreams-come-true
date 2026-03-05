# DreamComTrue

꿈해몽 · 사주 · 운세 서비스를 위한 Android WebView 대상 모바일 웹앱.

## 기술 스택

- **Frontend:** Vue 3 (Composition API) + Vite 6 + Tailwind CSS 3 + Pinia
- **Backend:** Node.js + Express.js + JWT
- **패키지 매니저:** npm workspaces

## 개발 시작

```bash
# 의존성 설치 (루트에서 한 번에)
npm install

# 개발 서버 실행
npm run dev:frontend    # http://localhost:5173
npm run dev:backend     # http://localhost:8080

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
dreamcomtrue/
├── frontend/        # Vue 3 프론트엔드
└── backend/         # Express.js 백엔드
```

상세 구조는 [CLAUDE.md](./CLAUDE.md) 참고.

---

## Serena MCP 연동

[Serena](https://github.com/oraios/serena)는 Claude Code에 연결된 시맨틱 코딩 툴입니다.

### 프로젝트 등록 (최초 1회)

프로젝트를 Serena에 등록하면 이후 대화에서 자동으로 인식됩니다.

```bash
# 프로젝트 루트에서 실행
serena project create /Users/deoksoo.lee/WebstormProjects/dreamcomtrue

# 등록과 동시에 심볼 인덱싱까지 수행 (권장)
serena project create /Users/deoksoo.lee/WebstormProjects/dreamcomtrue --index
```

### 프로젝트 활성화 (대화 시작 시)

Claude Code 대화 중 Serena가 `No active project` 상태라면 아래 중 하나로 활성화합니다.

**방법 1 — Claude에게 요청:**
> "Serena로 dreamcomtrue 프로젝트 활성화해줘"

**방법 2 — MCP 도구 직접 호출 (Claude Code 내부):**
Serena의 `activate_project` 도구를 `dreamcomtrue` 인자로 호출합니다.

### 심볼 인덱싱 (코드 변경 후)

코드를 많이 수정한 뒤 Serena의 심볼 탐색이 부정확할 경우 재인덱싱합니다.

```bash
serena project index /Users/deoksoo.lee/WebstormProjects/dreamcomtrue
```

### Serena 설정 파일 위치

| 파일 | 설명 |
|------|------|
| `~/.serena/serena_config.yml` | 전역 설정 (등록된 프로젝트 목록 포함) |
| `~/.serena/logs/` | 실행 로그 |

### 웹 대시보드

Serena 실행 시 `http://localhost:24282/dashboard/` 에서 현재 상태와 로그를 확인할 수 있습니다.
