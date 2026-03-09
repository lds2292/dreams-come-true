#!/bin/bash
# SSM Parameter Store에 환경 변수 저장 (최초 1회)
# aws cli + 충분한 권한이 있는 IAM 자격증명 필요
# 사용: bash deploy/ssm-parameters.sh

REGION=ap-northeast-2
PATH_PREFIX=/dreamcomtrue/prod

put() {
  aws ssm put-parameter \
    --region "$REGION" \
    --name "${PATH_PREFIX}/$1" \
    --value "$2" \
    --type SecureString \
    --overwrite
  echo "Stored: ${PATH_PREFIX}/$1"
}

# 실제 값으로 교체 후 실행하세요
put PINECONE_API_KEY  "pc-xxxxxxxxxxxxxxxxxxxx"
put PINECONE_HOST     "https://dream-dictionary-xxxx.svc.pinecone.io"
put OPENAI_API_KEY    "sk-xxxxxxxxxxxxxxxxxxxx"
# put JWT_SECRET        "change-me-to-a-long-random-string"  # 로그인 기능 구현 시 활성화
put CORS_ORIGIN       "https://d1fjqnba5t46kv.cloudfront.net"

echo "✅ All parameters stored in SSM at ${PATH_PREFIX}/"
