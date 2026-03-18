#!/usr/bin/env bash
set -euo pipefail

# Creates a scrubbed copy of the production database for local development.
# Starts a temporary Docker Postgres, copies prod data, scrubs PII, and saves the result.
# Requires: DATABASE_URL env var (or fetches from AWS SSM), pg_dump, psql, docker.
#
# Usage:
#   ./dev/create-dev-db.sh                                # fetches DATABASE_URL from AWS SSM
#   DATABASE_URL="postgresql://..." ./dev/create-dev-db.sh  # uses provided DATABASE_URL

if [ -z "${DATABASE_URL:-}" ]; then
  echo "==> Fetching DATABASE_URL from AWS SSM..."
  DATABASE_URL="$(aws ssm get-parameter --name /classes-db/dsn --with-decryption --query Parameter.Value --output text)"
fi

# Strip Prisma-specific query params (e.g. ?schema=public) that pg_dump doesn't understand
DATABASE_URL="${DATABASE_URL%%\?*}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_FILE="$SCRIPT_DIR/dev-db.sql"
CONTAINER_NAME="asmbly-dev-db-temp"
LOCAL_PORT=54329
LOCAL_PASS="localdev"
LOCAL_URL="postgresql://postgres:$LOCAL_PASS@localhost:$LOCAL_PORT/postgres"

cleanup() {
  echo "==> Cleaning up temporary Postgres..."
  docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
}
trap cleanup EXIT

echo "==> Starting temporary Postgres..."
docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_PASSWORD="$LOCAL_PASS" \
  -p "$LOCAL_PORT:5432" \
  postgres:16 > /dev/null

echo "==> Waiting for Postgres to be ready..."
for i in $(seq 1 30); do
  if psql "$LOCAL_URL" -c "SELECT 1" > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "==> Copying production database..."
pg_dump "$DATABASE_URL" --no-owner --no-acl | psql "$LOCAL_URL" > /dev/null 2>&1

echo "==> Scrubbing PII..."
# Replaces real names/emails with e.g. "Test User3" <user3@test.com>
psql "$LOCAL_URL" <<'SQL'
UPDATE "NeonEventRequester"
SET email = 'user' || id || '@test.com',
    "firstName" = 'Test',
    "lastName" = 'User' || id;

UPDATE "NeonEventTeacher"
SET name = 'Teacher ' || id;

-- Replace real Neon IDs with sequential fake IDs (cascades to join table)
WITH numbered AS (
  SELECT "neonId", ROW_NUMBER() OVER (ORDER BY "neonId") AS new_id
  FROM "NeonEventInstanceCancellee"
)
UPDATE "NeonEventInstanceCancellee" c
SET "neonId" = n.new_id
FROM numbered n
WHERE c."neonId" = n."neonId";

DELETE FROM "Session";
DELETE FROM "User";
SQL

echo "==> Saving scrubbed database..."
pg_dump "$LOCAL_URL" --no-owner --no-acl > "$OUTPUT_FILE"

echo "==> Done! Output written to dev/dev-db.sql"
