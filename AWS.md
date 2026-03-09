# AWS 인프라 설정 기록 — DreamComTrue

> 리전: **ap-northeast-2 (서울)**
> 최초 구성일: 2026-03-09

---

## 목차
1. [전체 아키텍처](#전체-아키텍처)
2. [IAM](#iam)
3. [S3](#s3)
4. [CloudFront](#cloudfront)
5. [EC2](#ec2)
6. [SSM Parameter Store](#ssm-parameter-store)
7. [GitHub Actions 연동](#github-actions-연동)
8. [cron 백업](#cron-백업)

---

## 전체 아키텍처

```
브라우저
  └─ CloudFront (HTTPS) — d1fjqnba5t46kv.cloudfront.net
       ├─ Behavior: /*       → S3 (dreamcomtrue-****)   [정적 파일]
       └─ Behavior: /api/*   → EC2 :8080 (Express.js)       [API]

GitHub main push
  └─ GitHub Actions (environment: deploy)
       ├─ deploy-backend  → EC2 SSH → git pull + SSM → .env + PM2 재시작
       └─ deploy-frontend → Vite 빌드 → S3 sync + CloudFront 캐시 무효화
```

---

## IAM

### IAM 사용자 (GitHub Actions용)
- **용도:** GitHub Actions에서 S3 업로드 및 CloudFront 캐시 무효화
- **권한 정책:**
  - `AmazonS3FullAccess` (버킷: `dreamcomtrue-****`)
  - `CloudFrontFullAccess`
- **액세스 키:** GitHub Environment Secret으로 등록
  ```
  AWS_ACCESS_KEY_ID     = AKIA***************QX
  AWS_SECRET_ACCESS_KEY = ****************************************
  ```

### IAM Role (EC2용)
- **Role 이름:** `dreamcomtrue-ec2-role`
- **Trust relationship:** EC2 서비스
- **권한 정책:**
  - `AmazonSSMReadOnlyAccess` — SSM Parameter Store 읽기
  - `AmazonS3FullAccess` — feedback.jsonl 백업용
- **연결 대상:** EC2 인스턴스 (Modify IAM role로 연결)

---

## S3

| 항목 | 값 |
|------|---|
| 버킷명 | `dreamcomtrue-****` |
| 리전 | ap-northeast-2 |
| 퍼블릭 액세스 | 모두 차단 (Block all public access) |
| 정적 웹 호스팅 | 비활성화 (CloudFront OAC 방식 사용) |

### 버킷 정책 (CloudFront OAC)
CloudFront 배포에서 자동 생성된 정책을 복사하여 적용.
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipal",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::dreamcomtrue-****/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<CF_DIST_ID>"
      }
    }
  }]
}
```

---

## CloudFront

| 항목 | 값 |
|------|---|
| 배포 도메인 | `d1fjqnba5t46kv.cloudfront.net` |
| 배포 ID | GitHub Secret `CF_DIST_ID`에 저장 |
| Default root object | `index.html` |
| Price class | Use all edge locations |

### Origins

| Origin | Domain | Protocol | Port |
|--------|--------|----------|------|
| S3 (프론트엔드) | `dreamcomtrue-****.s3.ap-northeast-2.amazonaws.com` | OAC | - |
| EC2 (API) | `ec2-3-35-***-**.ap-northeast-2.compute.amazonaws.com` | HTTP only | 8080 |

### Behaviors

| Path Pattern | Origin | Cache Policy | 비고 |
|-------------|--------|-------------|------|
| `/api/*` | EC2 | CachingDisabled / AllViewer | API 요청 |
| `/*` (Default) | S3 | CachingOptimized | SPA 정적 파일 |

### Error Pages (SPA 라우팅 대응)

| HTTP Error Code | Response Path | Response Code |
|----------------|--------------|---------------|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

---

## EC2

| 항목 | 값 |
|------|---|
| 인스턴스 타입 | t2.micro (또는 t3.micro) |
| AMI | Amazon Linux 2023 |
| 리전 | ap-northeast-2 |
| 퍼블릭 IP | `3.35.***.** ` (GitHub Secret `EC2_HOST`에 저장) |
| 퍼블릭 DNS | `ec2-3-35-***-**.ap-northeast-2.compute.amazonaws.com` |
| IAM Role | `dreamcomtrue-ec2-role` |
| PEM 키 | `dreamcomtrue.pem` (로컬 보관, GitHub Secret `EC2_SSH_KEY`에 등록) |

### 보안 그룹 인바운드 규칙

| Type | Protocol | Port | Source | 용도 |
|------|----------|------|--------|------|
| SSH | TCP | 22 | `0.0.0.0/0` | GitHub Actions 러너 IP가 매번 변경되어 전체 허용 — 추후 IP 제한 권장 |
| Custom TCP | TCP | 8080 | `0.0.0.0/0` | Express.js API |

### 설치 환경
```
Node.js 20 / npm / git / nginx / certbot / pm2
```

### 앱 경로
```
/home/ec2-user/app/
├── backend/
│   ├── .env          ← SSM에서 배포 시 자동 생성
│   └── ecosystem.config.js
└── ... (git clone으로 받은 레포)
```

### PM2 프로세스
```
pm2 status
# ┌─ id ─┬─ name ──────────────┬─ status ──┐
# │  0   │ dreamcomtrue-api    │ online    │
```

### 초기 설정
```bash
# 최초 1회 (IAM Role 연결 확인 후)
scp -i ~/Downloads/dreamcomtrue.pem deploy/ec2-setup.sh ec2-user@<EC2-IP>:~/
ssh -i ~/Downloads/dreamcomtrue.pem ec2-user@<EC2-IP> "bash ~/ec2-setup.sh"
```

---

## SSM Parameter Store

- **경로 prefix:** `/dreamcomtrue/prod/`
- **타입:** SecureString (KMS 암호화)
- **리전:** ap-northeast-2
- **등록 스크립트:** `deploy/ssm-parameters.sh`

### 등록된 파라미터

| 파라미터명 | 값 (마스킹) | 용도 |
|-----------|------------|------|
| `PINECONE_API_KEY` | `pc-**********************` | Pinecone 벡터 DB 인증 |
| `PINECONE_HOST` | `https://dream-dictionary-****.svc.pinecone.io` | Pinecone 인덱스 엔드포인트 |
| `PINECONE_INDEX_NAME` | `dream-dictionary` | Pinecone 인덱스명 |
| `OPENAI_API_KEY` | `sk-**********************` | OpenAI 임베딩 API |
| `CORS_ORIGIN` | `https://d1fjqnba5t46kv.cloudfront.net` | 백엔드 CORS 허용 출처 |
| `JWT_SECRET` | *(미활성화 — 로그인 구현 시 등록)* | JWT 서명 시크릿 |

### 파라미터 변경 후 반영
```bash
# 방법 1: push → GitHub Actions 자동 배포 시 .env 재생성
git commit --allow-empty -m "chore: trigger redeploy" && git push

# 방법 2: EC2에서 즉시 반영
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

---

## GitHub Actions 연동

**경로:** `.github/workflows/deploy.yml`
**Environment:** `deploy`
**트리거:** `main` 브랜치 push (단, `**/*.md` 변경만 있는 경우 스킵)

### GitHub Environment Secrets (`Settings → Environments → deploy`)

| Secret | 값 (마스킹) | 용도 |
|--------|-----------|------|
| `AWS_ACCESS_KEY_ID` | `AKIA***************QX` | S3/CloudFront 배포 |
| `AWS_SECRET_ACCESS_KEY` | `****************************` | S3/CloudFront 배포 |
| `S3_BUCKET` | `dreamcomtrue-****` | 프론트엔드 빌드 업로드 |
| `CF_DIST_ID` | `E1**************` | CloudFront 캐시 무효화 |
| `VITE_API_BASE_URL` | `https://d1fjqnba5t46kv.cloudfront.net/api` | 프론트 빌드 시 주입 |
| `EC2_HOST` | `3.35.***.** ` | EC2 SSH 접속 호스트 |
| `EC2_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----\n****` | EC2 SSH 인증 |

### 배포 순서
```
deploy-backend (EC2)
  → git pull
  → SSM → .env 재생성
  → npm ci --omit=dev
  → pm2 restart

deploy-frontend (S3 + CloudFront)  [needs: deploy-backend]
  → npm ci + Vite 빌드
  → aws s3 sync
  → CloudFront 캐시 무효화
```

---

## cron 백업

EC2에서 `feedback.jsonl`을 매일 새벽 2시에 S3로 백업.

```bash
# 등록 스크립트
bash deploy/crontab-backup.sh

# 등록된 cron
0 2 * * * aws s3 cp /home/ec2-user/app/data/feedback.jsonl \
  s3://dreamcomtrue-****/backups/feedback-$(date +%Y%m%d).jsonl
```

백업 경로: `s3://dreamcomtrue-****/backups/feedback-YYYYMMDD.jsonl`
