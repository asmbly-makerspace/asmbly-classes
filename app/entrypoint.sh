#!/usr/bin/env bash
set -e

PG_USER=$(cat /run/secrets/postgres-user) \
&& export PG_USER \
&& PG_PASSWORD=$(cat /run/secrets/postgres-password) \
&& export PG_PASSWORD \
&& DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@db:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public" \
&& export DATABASE_URL \
&& npx prisma generate \
&& npx prisma db push \
&& npx prisma db seed

exec "$@"