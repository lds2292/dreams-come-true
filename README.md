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

## 배포 구성

### 아키텍처

```
GitHub (main push)
  └─ GitHub Actions
       ├─ deploy-backend  → EC2 (SSH) → git pull + SSM → .env + PM2 재시작
       └─ deploy-frontend → S3 업로드 + CloudFront 캐시 무효화

브라우저 → CloudFront (HTTPS)
              ├─ /api/*  → EC2 :8080 (Express.js)
              └─ /*      → S3 (Vue 3 SPA)
```

---

### GitHub Environment Secrets

**Settings → Environments → `deploy` → Secrets** 에 아래 항목을 등록합니다.

| Secret | 용도 | 예시 |
|--------|------|------|
| `AWS_ACCESS_KEY_ID` | S3·CloudFront 배포용 IAM 키 | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | S3·CloudFront 배포용 IAM 시크릿 | `...` |
| `S3_BUCKET` | 프론트엔드 빌드 업로드 대상 버킷명 | `dreamcomtrue-frontend` |
| `CF_DIST_ID` | CloudFront 배포 ID (캐시 무효화용) | `E1XXXXXXXXXXXX` |
| `VITE_API_BASE_URL` | 프론트엔드 빌드 시 주입되는 API 베이스 URL | `https://d1fjqnba5t46kv.cloudfront.net/api` |
| `EC2_HOST` | 백엔드 EC2 퍼블릭 IP | `3.35.214.50` |
| `EC2_SSH_KEY` | EC2 접속용 PEM 키 전체 내용 | `-----BEGIN RSA PRIVATE KEY-----...` |

> Environment Secrets는 workflow 잡에 `environment: deploy` 선언이 있어야 읽힙니다.

---

### AWS SSM Parameter Store

EC2 런타임 환경변수는 SSM Parameter Store(`/dreamcomtrue/prod/`)에 저장하며,
배포 시 GitHub Actions가 EC2에서 자동으로 `backend/.env`를 재생성합니다.

**최초 등록 방법:**
```bash
# 값을 실제 값으로 교체 후 실행
bash deploy/ssm-parameters.sh
```

**등록된 파라미터 목록:**

| 파라미터 경로 | 용도 | 비고 |
|-------------|------|------|
| `/dreamcomtrue/prod/PINECONE_API_KEY` | Pinecone 벡터 DB API 키 | |
| `/dreamcomtrue/prod/PINECONE_HOST` | Pinecone 인덱스 엔드포인트 URL | |
| `/dreamcomtrue/prod/PINECONE_INDEX_NAME` | Pinecone 인덱스명 | `dream-dictionary` |
| `/dreamcomtrue/prod/OPENAI_API_KEY` | OpenAI API 키 (임베딩 생성용) | |
| `/dreamcomtrue/prod/CORS_ORIGIN` | 백엔드 CORS 허용 출처 | CloudFront 도메인 |
| `/dreamcomtrue/prod/JWT_SECRET` | JWT 서명 시크릿 | 로그인 구현 시 활성화 |

**파라미터 변경 후 반영 방법:**
- SSM에서 값 수정 후 `git push` → GitHub Actions 배포 시 자동으로 `.env` 재생성됨
- 즉시 반영이 필요하면 EC2에서 직접 실행:
```bash
cd /home/ec2-user/app
aws ssm get-parameters-by-path \
  --path /dreamcomtrue/prod/ \
  --with-decryption \
  --region ap-northeast-2 \
  --query "Parameters[*].[Name,Value]" \
  --output text | while read name value; do
    key=$(basename "$name")
    echo "${key}=${value}"
  done > backend/.env
pm2 restart dreamcomtrue-api
```

> EC2에 `dreamcomtrue-ec2-role` IAM Role이 연결돼 있어야 SSM 접근 가능.

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
