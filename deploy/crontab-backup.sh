#!/bin/bash
# EC2에서 feedback.jsonl을 S3로 매일 새벽 2시에 백업하는 cron 등록
# 사용: bash deploy/crontab-backup.sh

S3_BUCKET="dreamcomtrue-frontend"

CRON_JOB="0 2 * * * aws s3 cp /home/ec2-user/app/data/feedback.jsonl s3://${S3_BUCKET}/backups/feedback-\$(date +\%Y\%m\%d).jsonl 2>/dev/null"

# 기존 crontab에 추가 (중복 방지)
(crontab -l 2>/dev/null | grep -v "feedback.jsonl"; echo "$CRON_JOB") | crontab -

echo "✅ Cron job registered:"
echo "   $CRON_JOB"
