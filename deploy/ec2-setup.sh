#!/bin/bash
# EC2 초기 설정 스크립트 (Amazon Linux 2023 기준)
# 최초 1회만 실행

set -e

# ── 1. Node.js 20 + PM2 설치 ──────────────────────────────
sudo dnf install -y nodejs npm git nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# ── 2. 앱 디렉토리 + 레포 클론 ────────────────────────────
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app
git clone https://github.com/<YOUR_ORG>/dreamcomtrue.git .

# ── 3. 백엔드 의존성 설치 ────────────────────────────────
cd backend
npm ci --omit=dev

# ── 4. SSM → .env 로드 (IAM Role에 ssm:GetParametersByPath 권한 필요) ──
# 아래 명령은 배포마다 GitHub Actions에서 실행하거나 서버 시작 시 실행합니다.
aws ssm get-parameters-by-path \
  --path /dreamcomtrue/prod/ \
  --with-decryption \
  --region ap-northeast-2 \
  --query "Parameters[*].[Name,Value]" \
  --output text | while read name value; do
    key=$(basename "$name")   # /dreamcomtrue/prod/FOO → FOO
    echo "${key}=${value}"
  done > /home/ec2-user/app/backend/.env

# ── 5. PM2 시작 + 부팅 자동 실행 등록 ────────────────────
cd /home/ec2-user/app/backend
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# ── 6. Nginx 설정 ────────────────────────────────────────
# /etc/nginx/conf.d/dreamcomtrue.conf 파일을 배치합니다 (아래 내용)
sudo tee /etc/nginx/conf.d/dreamcomtrue.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo systemctl enable nginx
sudo systemctl restart nginx

# ── 7. SSL (Let's Encrypt) ────────────────────────────────
# DNS 설정 완료 후 실행
# sudo certbot --nginx -d api.yourdomain.com

echo "✅ EC2 setup complete. Update api.yourdomain.com in Nginx config & run certbot for SSL."
