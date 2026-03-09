# DreamComTrue — AWS MVP 배포 가이드

> 작성일: 2026-03-09
> 리전: **ap-northeast-2 (서울)**
> 목표: MVP 최저비용 운영

---

## 아키텍처 개요

```
[Android WebView / Browser]
         │
         ▼
[CloudFront CDN] ──── [S3 Bucket] (frontend 정적 파일, ap-northeast-2)
         │
         │ /api/* 요청
         ▼
[EC2 t2.micro, ap-northeast-2] (Express.js :8080)
         │  ↑ Nginx 리버스 프록시 (80/443 → 8080)
         │
         ├── [Pinecone] (외부 벡터 DB)
         ├── [OpenAI]   (외부 임베딩/GPT)
         └── data/feedback.jsonl (EC2 로컬 파일)
```

---

## 월 예상 비용 (서울 리전 기준)

| 서비스 | 사양 | 월 비용 |
|--------|------|:-------:|
| EC2 t2.micro | 1 vCPU / 1GB RAM, 24시간 상시 가동 | ~$11 |
| EBS gp3 | 30GB | ~$2.4 |
| Elastic IP | 인스턴스 연결 시 | 무료 |
| S3 | 프론트 정적 파일 호스팅 (~50MB) | ~$0.5 이하 |
| CloudFront | 한국 트래픽 기준 (저트래픽 MVP) | ~$1–2 |
| ACM (SSL) | CloudFront + 백엔드 인증서 | 무료 |
| SSM Parameter Store | 표준 티어 | 무료 |
| Route 53 | 호스팅 영역 1개 + 쿼리 | ~$0.5 |
| **합계** | | **~$15–17/월** |

> Pinecone, OpenAI 비용은 별도 (기존과 동일)

---

## 구현된 파일 목록

### 신규 생성

| 파일 | 설명 |
|------|------|
| `backend/ecosystem.config.js` | PM2 프로세스 설정 |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD 파이프라인 |
| `deploy/ec2-setup.sh` | EC2 최초 환경 구성 스크립트 |
| `deploy/ssm-parameters.sh` | SSM Parameter Store 초기 등록 스크립트 |
| `deploy/crontab-backup.sh` | feedback.jsonl S3 일일 백업 cron 등록 |

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `backend/src/app.js` | CORS origin을 `CORS_ORIGIN` 환경변수로 제어 (프로덕션: 화이트리스트, 개발: 전체 허용) |
| `frontend/.env.production` | 실제 값은 GitHub Actions secret `VITE_API_BASE_URL`로 빌드 시 주입 |

---

## 배포 전 사전 준비

### 1. GitHub Secrets 등록

저장소 → Settings → Secrets and variables → Actions에 아래 값을 등록합니다.

| Secret 이름 | 설명 |
|-------------|------|
| `AWS_ACCESS_KEY_ID` | AWS IAM 배포 전용 사용자 Access Key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM 배포 전용 사용자 Secret Key |
| `S3_BUCKET` | S3 버킷 이름 (예: `dreamcomtrue-frontend`) |
| `CF_DIST_ID` | CloudFront 배포 ID |
| `EC2_HOST` | EC2 퍼블릭 IP 또는 도메인 (예: `api.yourdomain.com`) |
| `EC2_SSH_KEY` | EC2 접속용 PEM 키 내용 (전체 텍스트) |
| `VITE_API_BASE_URL` | 백엔드 API URL (예: `https://api.yourdomain.com/api`) |

### 2. IAM 권한

**배포용 IAM 사용자** (GitHub Actions):
- `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`
- `cloudfront:CreateInvalidation`

**EC2 IAM Role** (인스턴스에 직접 부여):
- `ssm:GetParametersByPath`
- `s3:PutObject` (backup용)

---

## 단계별 배포 절차

### Step 1 — AWS 인프라 생성 (콘솔)

#### EC2

> 리전: **ap-northeast-2 (서울)**

- AMI: Amazon Linux 2023
- 인스턴스 타입: `t2.micro`
- 스토리지: 30GB gp3
- 보안그룹 인바운드: `22(SSH)`, `80(HTTP)`, `443(HTTPS)`
- Elastic IP 할당 후 인스턴스에 연결

#### S3

> 리전: **ap-northeast-2 (서울)**

```bash
aws s3 mb s3://dreamcomtrue-frontend --region ap-northeast-2
```

- 퍼블릭 액세스 차단 (CloudFront OAC 사용)

#### CloudFront

- Origin: S3 버킷 `ap-northeast-2` (OAC 방식)
- Default Root Object: `index.html`
- Error Pages: `403` → `/index.html` (200), `404` → `/index.html` (200)
- Price Class: `PriceClass_200` (아시아/한국 포함)
- SSL: ACM 인증서 연결

> **주의:** CloudFront용 ACM 인증서는 반드시 **us-east-1 (버지니아)** 리전에서 발급해야 합니다.
> 백엔드(EC2) Nginx용 인증서는 Let's Encrypt를 사용하므로 리전 무관합니다.

#### ACM 인증서

| 용도 | 발급 리전 | 방법 |
|------|----------|------|
| CloudFront (프론트) | **us-east-1** | AWS ACM 콘솔 → DNS 검증 |
| EC2 Nginx (백엔드 API) | 리전 무관 | Let's Encrypt (Certbot) |

- CloudFront용 도메인: `yourdomain.com`, `*.yourdomain.com`
- DNS 검증 → Route 53 자동 레코드 추가

---

### Step 2 — SSM Parameter Store 등록

> 리전: **ap-northeast-2 (서울)**

`deploy/ssm-parameters.sh`의 값을 실제 키로 교체 후 실행:

```bash
bash deploy/ssm-parameters.sh
```

저장되는 파라미터 경로:
```
/dreamcomtrue/prod/PINECONE_API_KEY
/dreamcomtrue/prod/PINECONE_HOST
/dreamcomtrue/prod/OPENAI_API_KEY
/dreamcomtrue/prod/JWT_SECRET
/dreamcomtrue/prod/CORS_ORIGIN
```

---

### Step 3 — EC2 초기 설정

EC2에 SSH 접속 후:

```bash
# 스크립트 내 <YOUR_ORG>와 yourdomain.com을 실제 값으로 수정 후 실행
bash deploy/ec2-setup.sh
```

수행 내용:
1. Node.js 20 + PM2 + Nginx + Certbot 설치
2. GitHub 레포 클론 (`/home/ec2-user/app`)
3. 백엔드 의존성 설치 (`npm ci --omit=dev`)
4. SSM (`ap-northeast-2`)에서 `.env` 자동 생성
5. PM2 시작 + 부팅 자동 실행 등록
6. Nginx 리버스 프록시 설정 (포트 80/443 → 8080)

#### SSL 발급 (DNS 설정 완료 후)

```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

### Step 4 — feedback.jsonl 백업 cron 등록

```bash
bash deploy/crontab-backup.sh
```

매일 새벽 02:00 (UTC, 한국시간 11:00)에 `data/feedback.jsonl`을 S3에 백업:
```
s3://dreamcomtrue-frontend/backups/feedback-YYYYMMDD.jsonl
```

---

### Step 5 — CI/CD 파이프라인 확인

`main` 브랜치에 push하면 GitHub Actions가 자동 실행됩니다.

```
.github/workflows/deploy.yml
├── deploy-frontend                         (aws-region: ap-northeast-2)
│   ├── npm ci → npm run build (VITE_API_BASE_URL secret 주입)
│   ├── aws s3 sync frontend/dist/ → S3
│   └── CloudFront 캐시 무효화 (/* 전체)
└── deploy-backend
    └── EC2 SSH → git pull → npm ci --omit=dev → pm2 restart
```

---

## 검증 체크리스트

```bash
# 1. PM2 프로세스 확인
ssh ec2-user@<EC2_IP> "pm2 status"

# 2. 헬스체크 API
curl https://api.yourdomain.com/api/health
# 예상 응답: {"status":"ok"}

# 3. 프론트엔드 접속
# 브라우저에서 https://yourdomain.com 접속 → 앱 정상 로딩

# 4. 검색 기능 테스트 (Pinecone + OpenAI 연동)
curl "https://api.yourdomain.com/api/dreams/search?q=용꿈"

# 5. 피드백 저장 확인
curl -X POST https://api.yourdomain.com/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"dreamId":"ACT-1","rating":5}'
# EC2에서: cat /home/ec2-user/app/data/feedback.jsonl
```

---

## PM2 주요 명령어

```bash
pm2 status                    # 프로세스 상태 확인
pm2 logs dreamcomtrue-api     # 실시간 로그
pm2 restart dreamcomtrue-api  # 재시작
pm2 stop dreamcomtrue-api     # 중지
pm2 monit                     # 리소스 모니터링
```

---

## 환경변수 구조

### 백엔드 (SSM ap-northeast-2 → EC2 `.env`)

| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본: `8080`) |
| `NODE_ENV` | `production` |
| `PINECONE_API_KEY` | Pinecone API 키 |
| `PINECONE_HOST` | Pinecone 인덱스 호스트 URL |
| `OPENAI_API_KEY` | OpenAI API 키 |
| `JWT_SECRET` | JWT 서명 시크릿 |
| `CORS_ORIGIN` | 허용 도메인 (콤마 구분, 예: `https://yourdomain.com`) |

### 프론트엔드 (GitHub Actions Secret)

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | 백엔드 API 기본 URL (예: `https://api.yourdomain.com/api`) |

---

## 트러블슈팅

### CORS 오류
- `CORS_ORIGIN` SSM 파라미터에 프론트엔드 도메인이 정확히 등록되어 있는지 확인
- 도메인 앞 `https://` 포함, 콤마로 구분 (공백 무관)

### CloudFront 404 (SPA 라우팅)
- CloudFront Error Pages에서 `403`, `404` → `/index.html` (HTTP 200) 설정 확인

### PM2 재시작 루프
```bash
pm2 logs dreamcomtrue-api --lines 50  # 에러 원인 확인
```
- `.env` 파일 누락 또는 SSM 파라미터 미등록 가능성 체크
- SSM 리전이 `ap-northeast-2`로 일치하는지 확인

### Let's Encrypt 발급 실패
- EC2 보안그룹에 포트 80 인바운드 허용 여부 확인
- DNS A 레코드가 Elastic IP를 정확히 가리키는지 확인 (`dig api.yourdomain.com`)

### ACM 인증서가 CloudFront에 표시되지 않음
- 인증서 발급 리전이 **us-east-1**인지 확인 (ap-northeast-2에서 발급 시 CloudFront에서 선택 불가)
