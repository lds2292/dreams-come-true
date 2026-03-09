# 배포 트러블슈팅 기록

S3 + CloudFront 프론트엔드 배포 과정에서 발생한 이슈와 해결 방법을 기록합니다.

---

## Issue 1 — Rollup Linux 바이너리 누락 (CI 빌드 실패)

### 증상
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

### 원인
`package-lock.json`이 macOS(arm64)에서 생성되어 `@rollup/rollup-darwin-arm64`만
lockfile에 완전히 resolve됨. Linux CI 환경에서 `npm ci` 실행 시 `@rollup/rollup-linux-x64-gnu`
항목이 lockfile에 없어 설치 불가.

### 해결
`.github/workflows/deploy.yml`의 Install dependencies 스텝 이후 Linux 바이너리를 명시적으로 설치.

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Rollup Linux binary
  run: npm install --no-save @rollup/rollup-linux-x64-gnu
```

---

## Issue 2 — AWS 자격증명 로드 실패 (GitHub Secrets 위치 불일치)

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
`.github/workflows/deploy.yml`의 `deploy-frontend` 잡에 `environment: deploy` 추가.

```yaml
deploy-frontend:
  name: Deploy Frontend (S3 + CloudFront)
  runs-on: ubuntu-latest
  environment: deploy   # ← 추가
  steps:
    ...
```

> Environment Secrets 방식이 권한 관리 측면에서 더 좋은 방법이므로, 설정을 바꾸지 않고 workflow를 수정함.

---

## Issue 3 — CloudFront AccessDenied (S3 버킷 정책 미적용)

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

## Issue 4 — CloudFront AccessDenied (Default Root Object 미설정)

### 증상
버킷 정책 적용 후에도 루트 URL 접속 시 AccessDenied 지속.

### 원인
CloudFront **Default Root Object**가 설정되지 않아 `/` 접근 시 S3 버킷 목록(List)을
요청하게 됨. 버킷 목록 조회는 OAC 정책에 허용되지 않아 AccessDenied 발생.

### 해결
**CloudFront 콘솔** → 배포 선택 → **General 탭** → **Settings** → **Edit**
→ **Default root object** 항목에 `index.html` 입력 후 저장.

---

## 최종 정상 동작 확인

| 항목 | 결과 |
|------|------|
| `https://d1fjqnba5t46kv.cloudfront.net` 접속 | 정상 로딩 |
| GitHub Actions `deploy-frontend` 잡 | 녹색 |
| S3 파일 업로드 | 정상 |
| CloudFront 캐시 무효화 | 정상 |
