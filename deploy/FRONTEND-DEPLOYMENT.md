# 프론트엔드 배포 가이드 (S3 + CloudFront)

> DreamComTrue Vue 3 SPA 프론트엔드 단독 배포 절차.
> 백엔드(EC2)는 별도 배포 예정 — 준비 완료 후 `deploy.yml`의 `deploy-backend` 잡 주석 해제.

---

## 전제 조건

- AWS 계정 및 IAM 관리자 접근 권한
- GitHub 저장소 관리자 권한 (Secrets 등록용)
- AWS CLI 설치 (로컬 확인용, 선택)

---

## Step 1 — S3 버킷 생성 (ap-northeast-2)

1. AWS 콘솔 → **S3** → **버킷 만들기**
2. 버킷 이름: `dreamcomtrue-frontend`
3. 리전: **아시아 태평양(서울) ap-northeast-2**
4. **퍼블릭 액세스 차단**: 모두 체크 유지 (CloudFront OAC가 처리)
5. 정적 웹사이트 호스팅: **비활성화** (CloudFront에서 처리)
6. 나머지 기본값 유지 → **버킷 만들기**

---

## Step 2 — CloudFront 배포 생성

1. AWS 콘솔 → **CloudFront** → **배포 생성**

2. **Origin 설정**
   - Origin domain: `dreamcomtrue-frontend.s3.ap-northeast-2.amazonaws.com`
   - Origin access: **Origin access control settings (recommended)** 선택
   - Origin access control: **새 OAC 생성** (이름: `dreamcomtrue-oac`, Sign requests: Yes)
   - 배포 생성 후 표시되는 **S3 버킷 정책 복사 → S3 버킷 권한 탭에 붙여넣기**

3. **Default cache behavior**
   - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - Cache policy: `CachingOptimized` (기본값)

4. **Settings**
   - Default root object: `index.html`
   - Price class: **Use North America, Europe, Asia, Middle East, and Africa** (PriceClass_200)
   - SSL 인증서: **Default CloudFront certificate** (도메인 없음, ACM 불필요)

5. **Custom error pages** (SPA 라우팅 처리 필수)
   - **오류 코드 추가 (1번)**
     - HTTP error code: `403`
     - Response page path: `/index.html`
     - HTTP response code: `200`
   - **오류 코드 추가 (2번)**
     - HTTP error code: `404`
     - Response page path: `/index.html`
     - HTTP response code: `200`

6. **배포 생성** → 상태가 `Enabled`가 될 때까지 대기 (약 5~10분)
7. 배포 완료 후 **Distribution domain name** 메모: `xxxx.cloudfront.net`

---

## Step 3 — IAM 사용자 생성 (GitHub Actions 전용)

1. AWS 콘솔 → **IAM** → **사용자** → **사용자 생성**
2. 사용자 이름: `dreamcomtrue-deployer`
3. **직접 정책 연결** → 아래 인라인 정책 생성

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::dreamcomtrue-frontend",
        "arn:aws:s3:::dreamcomtrue-frontend/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<CF_DIST_ID>"
    }
  ]
}
```

4. 사용자 생성 후 → **보안 자격 증명** 탭 → **액세스 키 만들기**
5. 생성된 **Access Key ID** 와 **Secret Access Key** 메모 (이후 GitHub Secrets에 등록)

---

## Step 4 — GitHub Secrets 등록

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 이름 | 값 |
|------------|---|
| `AWS_ACCESS_KEY_ID` | IAM 사용자 액세스 키 ID |
| `AWS_SECRET_ACCESS_KEY` | IAM 사용자 시크릿 액세스 키 |
| `S3_BUCKET` | `dreamcomtrue-frontend` |
| `CF_DIST_ID` | CloudFront 배포 ID (예: `E1ABCDEF123456`) |
| `VITE_API_BASE_URL` | 빈값으로 설정 (백엔드 배포 후 EC2 주소로 교체) |

---

## CI/CD 흐름

```
main 브랜치 push
  └── deploy-frontend 잡 (GitHub Actions)
        ├── actions/checkout@v4
        ├── actions/setup-node@v4 (Node 20)
        ├── npm ci
        ├── npm run build  ← VITE_API_BASE_URL secret 주입
        ├── aws s3 sync frontend/dist/ → s3://dreamcomtrue-frontend/ --delete
        └── aws cloudfront create-invalidation --paths "/*"
```

---

## 검증

1. GitHub → **Actions** 탭 → `Deploy to AWS` 워크플로 → `deploy-frontend` 잡 녹색 확인
2. 브라우저에서 `https://xxxx.cloudfront.net` 접속 → 앱 정상 로딩 확인
3. `/search`, `/my` 등 SPA 내부 경로 **직접 URL 입력** → 404 없이 정상 표시 확인
4. API 호출 실패(백엔드 미배포)는 정상 동작 — 검색창 오류 메시지 표시로 확인

---

## 백엔드(EC2) 배포 후 추가 작업

1. GitHub Secret `VITE_API_BASE_URL` → EC2 퍼블릭 IP로 업데이트
   - 예: `http://<EC2-PUBLIC-IP>:8080/api`
2. `frontend/.env.production`의 주석 참고하여 값 설정
3. `.github/workflows/deploy.yml`의 `deploy-backend` 잡 주석 해제
4. EC2 백엔드 `CORS_ORIGIN` 환경변수에 CloudFront URL 등록
   - 예: `https://xxxx.cloudfront.net`

---

## 비용 예상 (최소 운영 기준)

| 서비스 | 예상 비용 |
|--------|----------|
| S3 (저장 + 요청) | ~$0.03/월 (소규모) |
| CloudFront (PriceClass_200) | 무료 티어 1TB/월 |
| 도메인 | $0 (CloudFront 기본 URL 사용) |
| ACM 인증서 | $0 (CloudFront 기본 인증서) |

> 트래픽이 매우 적은 초기 단계에서는 사실상 무료 수준.
