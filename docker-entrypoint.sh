#!/bin/bash
set -e

echo "==> Running database migrations..."
npx prisma migrate deploy

echo "==> Seeding database (skips existing entries)..."
node dist/seed.js

echo "==> Starting evv-monitor..."
exec node dist/index.js
