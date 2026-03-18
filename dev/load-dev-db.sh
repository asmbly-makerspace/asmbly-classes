#!/usr/bin/env bash
set -euo pipefail

# Starts a local Postgres container and loads the dev database.
# Requires: docker, psql.
#
# Usage:
#   ./dev/load-dev-db.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_FILE="$SCRIPT_DIR/dev-db.sql"
CONTAINER_NAME="asmbly-dev-db"
LOCAL_PASS="localdev"
LOCAL_URL="postgresql://postgres:$LOCAL_PASS@localhost:5432/postgres"

if [ ! -f "$DB_FILE" ]; then
  echo "Error: dev/dev-db.sql not found. Ask a maintainer to generate it."
  exit 1
fi

# Start or restart the container
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "==> Removing existing container..."
  docker rm -f "$CONTAINER_NAME" > /dev/null
fi

echo "==> Starting Postgres..."
docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_PASSWORD="$LOCAL_PASS" \
  -p 5432:5432 \
  postgres:16 > /dev/null

echo "==> Waiting for Postgres to be ready..."
for i in $(seq 1 30); do
  if psql "$LOCAL_URL" -c "SELECT 1" > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "==> Loading dev database..."
psql "$LOCAL_URL" -f "$DB_FILE" > /dev/null 2>&1

echo "==> Installing dependencies..."
cd "$SCRIPT_DIR/../app"
npm install

echo "==> Starting dev server at http://localhost:5173..."
DATABASE_URL="$LOCAL_URL" npm run dev
