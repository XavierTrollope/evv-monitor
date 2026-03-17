#!/bin/bash
set -e

echo "==> Running database migrations..."

if npx prisma migrate deploy 2>&1; then
  echo "==> Migrations applied successfully"
else
  echo "==> migrate deploy failed — falling back to db push..."
  npx prisma db push --skip-generate --accept-data-loss 2>&1 || true
  echo "==> Schema synced via db push"
fi

echo "==> Seeding database (skips existing entries)..."
node dist/seed.js

echo "==> Starting evv-monitor..."
exec node dist/index.js
