#!/bin/bash
# deploy.sh — Copy evv-monitor to your NAS and start it
# Usage: ./deploy.sh <NAS_IP> [SSH_USER]
#
# Example: ./deploy.sh 192.168.1.50 admin

set -e

NAS_IP="${1:?Usage: ./deploy.sh <NAS_IP> [SSH_USER]}"
SSH_USER="${2:-root}"
REMOTE_DIR="/opt/evv-monitor"

echo "==> Packaging project..."
tar czf /tmp/evv-monitor.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude='*.db' \
  --exclude='*.db-journal' \
  --exclude=agent-transcripts \
  -C "$(dirname "$0")" .

echo "==> Uploading to ${SSH_USER}@${NAS_IP}:${REMOTE_DIR}..."
ssh "${SSH_USER}@${NAS_IP}" "mkdir -p ${REMOTE_DIR}"
scp /tmp/evv-monitor.tar.gz "${SSH_USER}@${NAS_IP}:${REMOTE_DIR}/evv-monitor.tar.gz"
ssh "${SSH_USER}@${NAS_IP}" "cd ${REMOTE_DIR} && tar xzf evv-monitor.tar.gz && rm evv-monitor.tar.gz"

echo ""
echo "==> Files uploaded. Now SSH into your NAS and start the service:"
echo ""
echo "    ssh ${SSH_USER}@${NAS_IP}"
echo "    cd ${REMOTE_DIR}"
echo "    cp .env.example .env"
echo "    nano .env              # set your SLACK_WEBHOOK_URL, SEARCH_API_KEY, etc."
echo "    docker compose up -d --build"
echo ""
echo "==> The dashboard will be at http://${NAS_IP}:3000"
echo ""

rm /tmp/evv-monitor.tar.gz
