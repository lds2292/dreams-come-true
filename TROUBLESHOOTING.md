# Troubleshooting — DreamComTrue 배포 이슈 모음

프론트엔드(S3+CloudFront) 및 백엔드(EC2) 배포 과정에서 발생한 이슈와 해결 방법을 기록합니다.

---

## 목차

### 프론트엔드 (S3 + CloudFront)
1. [Rollup Linux 바이너리 누락 (CI 빌드 실패)](#1-rollup-linux-바이너리-누락-ci-빌드-실패)
2. [AWS 자격증명 로드 실패 (GitHub Secrets 위치 불일치)](#2-aws-자격증명-로드-실패-github-secrets-위치-불일치)
3. [CloudFront AccessDenied — S3 버킷 정책 미적용](#3-cloudfront-accessdenied--s3-버킷-정책-미적용)
4. [CloudFront AccessDenied — Default Root Object 미설정](#4-cloudfront-accessdenied--default-root-object-미설정)
5. [CloudFront SPA 라우팅 AccessDenied](#5-cloudfront-spa-라우팅-accessdenied)

### 백엔드 (EC2)
6. [EC2 git clone 실패 — 인증 오류](#6-ec2-git-clone-실패--인증-오류)
7. [GitHub Actions SSH 타임아웃](#7-github-actions-ssh-타임아웃)
8. [Mixed Content — API 호출 차단](#8-mixed-content--api-호출-차단)
9. [CloudFront Origin에 EC2 IP 직접 입력 불가](#9-cloudfront-origin에-ec2-ip-직접-입력-불가)
10. [SSM → .env 미생성 — IAM Role 미연결](#10-ssm--env-미생성--iam-role-미연결)
11. [백엔드 500 오류 — PINECONE_INDEX_NAME 미설정](#11-백엔드-500-오류--pinecone_index_name-미설정)
12. [express-rate-limit X-Forwarded-For 경고](#12-express-rate-limit-x-forwarded-for-경고)

---

## 1. Rollup Linux 바이너리 누락 (CI 빌드 실패)

### 증상
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

### 원인
`package-lock.json`이 macOS(arm64)에서 생성되어 `@rollup/rollup-darwin-arm64`만
lockfile에 resolve됨. Linux CI 환경에서 `npm ci` 실행 시 `@rollup/rollup-linux-x64-gnu`
항목이 없어 설치 불가.

### 해결
`.github/workflows/deploy.yml`의 Install dependencies 스텝 이후 Linux 바이너리를 명시적으로 설치.

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Rollup Linux binary
  run: npm install --no-save @rollup/rollup-linux-x64-gnu
```

---

## 2. AWS 자격증명 로드 실패 (GitHub Secrets 위치 불일치)

### 증상
```
Error: Credentials could not be loaded, please check your action inputs:
Could not load credentials from any providers
```

### 원인
GitHub Secrets를 **Repository Secrets**가 아닌 **Environment Secrets**
(`Settings → Environments → deploy → Secrets`)로 등록함.
Environment Secrets는 workflow 잡에 `environment:` 선언이 없으면 읽히지 않음.

### 해결
`.github/workflows/deploy.yml`의 각 잡에 `environment: deploy` 추가.

```yaml
deploy-frontend:
  runs-on: ubuntu-latest
  environment: deploy   # ← 추가
```

> Environment Secrets 방식이 권한 관리 측면에서 더 안전하므로, 설정을 바꾸지 않고 workflow를 수정함.

---

## 3. CloudFront AccessDenied — S3 버킷 정책 미적용

### 증상
```
https://xxxx.cloudfront.net 접속 시
<Code>AccessDenied</Code><Message>Access Denied</Message>
```

### 원인
CloudFront OAC(Origin Access Control) 방식은 S3 버킷에 CloudFront의 접근을 허용하는
버킷 정책을 **수동으로** 적용해야 함. 배포 생성 후 이 단계를 누락.

### 해결
1. **CloudFront 콘솔** → 배포 선택 → **Origins 탭** → Origin 편집
2. 상단 노란색 배너의 **"Copy policy"** 버튼으로 버킷 정책 복사
3. **S3 콘솔** → `dreamcomtrue-frontend` → **Permissions 탭** → **Bucket policy** → Edit → 붙여넣기 후 저장

적용되는 버킷 정책 형태:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipal",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::dreamcomtrue-frontend/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::<계정ID>:distribution/<배포ID>"
      }
    }
  }]
}
```

---

## 4. CloudFront AccessDenied — Default Root Object 미설정

### 증상
버킷 정책 적용 후에도 루트 URL 접속 시 AccessDenied 지속.

### 원인
CloudFront **Default Root Object**가 설정되지 않아 `/` 접근 시 S3 버킷 목록(List)을
요청하게 됨. 버킷 목록 조회는 OAC 정책에 허용되지 않아 AccessDenied 발생.

### 해결
**CloudFront 콘솔** → 배포 선택 → **General 탭** → **Settings** → **Edit**
→ **Default root object** 항목에 `index.html` 입력 후 저장.

---

## 5. CloudFront SPA 라우팅 AccessDenied

### 증상
`/search`, `/my` 등 SPA 경로를 직접 URL로 접근 시 AccessDenied 반환.

### 원인
CloudFront가 S3에서 해당 경로의 파일을 찾지 못해 403 반환.
Vue Router의 History 모드는 실제 파일이 없고 `index.html`이 라우팅을 처리해야 함.

### 해결
**AWS Console → CloudFront → 배포 선택 → Error pages → Create custom error response**

| HTTP error code | Response page path | HTTP response code |
|----------------|-------------------|-------------------|
| `403` | `/index.html` | `200` |
| `404` | `/index.html` | `200` |

---

## 6. EC2 git clone 실패 — 인증 오류

### 증상
```
fatal: could not read Username for 'https://github.com': No such device or address
```

### 원인
Private 레포를 HTTPS로 clone 시 EC2에 GitHub 인증 정보가 없음.

### 해결
**방법 A — 레포를 Public으로 변경 (권장, 시크릿이 없는 경우)**
- GitHub → Settings → Danger Zone → Change visibility → Public
- HTTPS clone URL 그대로 사용 가능

**방법 B — SSH Deploy Key 사용 (Private 유지 시)**
```bash
# EC2에서 키 생성
ssh-keygen -t ed25519 -C "ec2-deploy" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub  # 공개키 복사 → GitHub Deploy keys에 등록
```
GitHub → 레포 Settings → Deploy keys → Add deploy key → 공개키 붙여넣기

```bash
# ~/.ssh/config 추가
cat >> ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  StrictHostKeyChecking no
EOF
chmod 600 ~/.ssh/config
```
`ec2-setup.sh` clone URL을 SSH로 변경:
```bash
git clone git@github.com:<계정>/<레포>.git .
```

---

## 7. GitHub Actions SSH 타임아웃

### 증상
```
dial tcp ***:22: i/o timeout
Error: Process completed with exit code 1.
```

### 원인
EC2 보안 그룹의 인바운드 규칙에서 포트 22(SSH)가 특정 IP로만 허용돼 있어
GitHub Actions 러너(IP가 매번 변경)에서 접근 불가.

### 해결
**AWS Console → EC2 → Security Groups → 해당 보안그룹 → Inbound rules → Edit**

| Type | Port | Source |
|------|------|--------|
| SSH  | 22   | `0.0.0.0/0` |

---

## 8. Mixed Content — API 호출 차단

### 증상
브라우저 DevTools Network 탭에서 API 요청 Status: `blocked:mixed-content`

### 원인
프론트엔드는 HTTPS(CloudFront)로 서빙되는데 API는 HTTP(EC2 IP:8080)를 호출.
브라우저 보안 정책상 HTTPS 페이지에서 HTTP 리소스 로드 차단.

### 해결
기존 CloudFront에 EC2를 Origin으로 추가하여 `/api/*` 경로를 프록시.

**1. CloudFront → Origins → Create origin**
- Origin domain: EC2 퍼블릭 DNS (예: `ec2-3-35-214-50.ap-northeast-2.compute.amazonaws.com`)
- Protocol: HTTP only / Port: 8080

**2. CloudFront → Behaviors → Create behavior**
- Path pattern: `/api/*`
- Origin: 위에서 만든 EC2 origin
- Cache policy: `CachingDisabled`
- Origin request policy: `AllViewer`

**3. GitHub Secret 업데이트**
```
VITE_API_BASE_URL = https://<CloudFront 도메인>/api
```

**4. 재배포 트리거**
```bash
git commit --allow-empty -m "chore: API URL CloudFront 경유로 변경"
git push origin main
```

---

## 9. CloudFront Origin에 EC2 IP 직접 입력 불가

### 증상
CloudFront Origin domain 필드에 IP 주소(`x.x.x.x`) 입력 시 오류.

### 원인
CloudFront Origin은 IP가 아닌 도메인 형식만 허용.

### 해결
EC2 퍼블릭 DNS 형식 사용:
```
ec2-{IP-대시구분}.{리전}.compute.amazonaws.com
# 예: ec2-3-35-214-50.ap-northeast-2.compute.amazonaws.com
```

---

## 10. SSM → .env 미생성 — IAM Role 미연결

### 증상
EC2에서 `aws` CLI 실행 시:
```
Unable to locate credentials. You can configure credentials by running "aws login".
```
`/home/ec2-user/app/backend/.env` 파일이 존재하지 않음.

### 원인
EC2 인스턴스에 IAM Role이 연결되지 않아 AWS CLI 인증 실패.

### 해결
**AWS Console → EC2 → 인스턴스 선택 → Actions → Security → Modify IAM role**
→ `dreamcomtrue-ec2-role` 선택 → Update IAM role

연결 후 확인:
```bash
aws sts get-caller-identity  # 계정 정보 출력되면 정상
```

이후 `.env` 생성:
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

cat backend/.env
pm2 restart dreamcomtrue-api
```

### 예방
EC2 생성 시 IAM Role을 함께 지정. `ec2-setup.sh` 실행 전 Role 연결 여부 확인.

---

## 11. 백엔드 500 오류 — PINECONE_INDEX_NAME 미설정

### 증상
```json
{ "message": "오늘의 꿈해몽을 불러올 수 없습니다." }
```
PM2 로그:
```
[오늘의 꿈해몽 오류] PINECONE_INDEX_NAME 환경변수가 설정되지 않았습니다.
```

### 원인
SSM Parameter Store에 `PINECONE_INDEX_NAME` 파라미터가 누락됨.

### 해결
```bash
aws ssm put-parameter \
  --region ap-northeast-2 \
  --name /dreamcomtrue/prod/PINECONE_INDEX_NAME \
  --value "dream-dictionary" \
  --type SecureString \
  --overwrite
```
이후 EC2에서 `.env` 재생성 후 PM2 재시작 (→ [이슈 10](#10-ssm--env-미생성--iam-role-미연결) 참고).

### 예방
`deploy.yml`의 deploy-backend 잡에 SSM → `.env` 재생성 스텝 포함 (현재 적용됨).
SSM 파라미터 추가/변경 시 push만 하면 자동 반영.

---

## 12. express-rate-limit X-Forwarded-For 경고

### 증상
PM2 로그:
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
```

### 원인
CloudFront → Nginx → Express 구조에서 `X-Forwarded-For` 헤더가 전달되는데
Express의 `trust proxy`가 기본값 `false`라 rate-limit이 경고 발생.

### 해결
`backend/src/app.js`에 추가:
```js
app.set('trust proxy', 1);
```
