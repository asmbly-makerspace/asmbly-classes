# Local Development Setup

Requires: Docker, Node.js, psql.

## For contributors

```bash
./dev/load-dev-db.sh
```

This starts a local Postgres, loads the dev database, installs dependencies, and runs the app at http://localhost:5173.

Run it again to reset the database and restart.

---

## For maintainers

To update the dev database with fresh production data:

```bash
./dev/create-dev-db.sh
```

This fetches `DATABASE_URL` from AWS SSM, copies the production database, scrubs PII, and writes the result to `dev/dev-db.sql`. Commit and push the updated file.

You can also provide `DATABASE_URL` directly:

```bash
DATABASE_URL="postgresql://..." ./dev/create-dev-db.sh
```

### What gets scrubbed

- `NeonEventRequester` — emails and names replaced (e.g. "Test User3", `user3@test.com`)
- `NeonEventTeacher` — names replaced (e.g. "Teacher 5")
- `NeonEventInstanceCancellee` — Neon IDs replaced with sequential fake IDs
- `Session` — all rows deleted
- `User` — all rows deleted

Class data (event types, instances, teachers, categories, schedules) is left as-is since it's all public.
