# asmbly-classes

This is the public class listing and registration site for [Asmbly Makerspace](https://asmbly.org), served at [classes.asmbly.org](https://classes.asmbly.org).

Members browse + waitlist + request classes, and are routed to Neon to register for classes. There's also a WIP page where users can authenticate with Neon in order to cancel class registration. Class data is sourced from Neon CRM and kept in sync via a scheduled job.

## Repository layout

```
.
├── app/                # SvelteKit application (the site itself)
├── cron-service/       # AWS Lambda jobs: Neon sync + weekly reporting
├── dev/                # Local dev DB tooling (see dev/README.md)
└── .github/            # CI: tests, build/push images to ECR, deploy Lambda, merge class photos
```

## Tech stack overview

- **Web app**: SvelteKit on the Node adapter, Vite, Tailwind CSS, DaisyUI
- **Hosting**: AWS App Runner (web app), AWS Lambda with EventBridge (recurring jobs written in node)
- **Database**: PostgreSQL on Amazon RDS, accessed via Prisma; both the app and recurring jobs connect to it via the same DSN (`DATABASE_URL` on App Runner, SSM `/classes-db/dsn` on Lambda) and share the same Prisma schema
- **Email**: Nodemailer (Gmail SMTP)
- **CI/CD**: GitHub Actions → AWS ECR → App Runner / Lambda

## Web app

Runs on **AWS App Runner**, which auto-pulls the `classes-page` image from ECR on each push to `main`. App Runner handles HTTPS at `classes.asmbly.org`, and routes traffic to the SvelteKit Node server (port 3000).

Routes (`app/src/routes/(data-pages)/`):
- `/` — search and filter all visible classes (category, sort, group-by-type)
- `/event/[eventTypeId]` — class detail page with all upcoming instances
- `/my-classes` — WIP: Neon CRM OAuth flow that lets users view their registrations and request cancellations

Internal API:
- `POST /api/class-registration` — Neon webhook; bumps attendee count; marks the registrant's own waitlist request as fulfilled if they had one
- `POST /api/class-cancellation` — Neon webhook; decrements attendee count; emails all waitlist requesters about the open seat (first-come-first-served)

## Recurring jobs

`cron-service/` is packaged as a Lambda container image, deployed to the `classes-crons` Lambda function, and invoked from AWS EventBridge (it is no longer actually a cron job). The handler reads `cronType` from the event payload and dispatches:

| `cronType`                | Schedule (CT)        | What it does                                                                 |
| ------------------------- | -------------------- | ---------------------------------------------------------------------------- |
| `hourlyClassMaintenance`  | Every hour, :30      | Pulls active events from Neon, upserts instances, prunes deleted events      |
| `weeklyReportingMetrics`  | Sunday 07:00         | Emails `classes@asmbly.org` a digest of waitlist / on-demand / notify requests |

Secrets are pulled at runtime from AWS SSM Parameter Store.

**Note on schema duplication:** `cron-service/prisma/schema.prisma` and `cron-service/prisma/migrations/` are byte-identical copies of the ones under `app/prisma/` so the cron image can run `prisma generate` at build time. Schema changes have to be copied into both folders, or the Lambdas will silently go stale.

## Database

Defined in `app/prisma/schema.prisma`:

- `NeonEventType` — class template (e.g. "Woodworking 101")
- `NeonEventInstance` — a specific scheduled session (date, teacher, capacity, price)
- `NeonEventCategory`/`AsmblyArchCategory` — categories for classes, Arch being more general (CNC Router -> Woodworking)
- `NeonEventTeacher` — instructor records
- `NeonEventInstanceRequest` — waitlist for a specific instance
- `NeonEventTypeRequest` — "notify me when scheduled" / on-demand requests for a type
- `NeonEventRequester` — email/name of a requester
- `NeonEventInstanceCancellee` — tracks who has cancelled (prevents double-decrement)
- `User` + `Session` — local auth records keyed by `neon_id`

Migrations live in `app/prisma/migrations/` and are applied by `prisma migrate deploy` at container startup, so DB migrations are applied on every deploy.

## Local development

See [`dev/README.md`](dev/README.md) for setting up the website to run locally.

## App scripts

Run from `app/`. Other scripts in `package.json` are container-internal or unused.

| Script           | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `npm run lint`   | Prettier check + ESLint                                   |
| `npm run format` | Prettier write                                            |
| `npm run dev`    | Vite dev server — usually invoked by `dev/load-dev-db.sh` |

## Testing

Run from `app/`.

| Command                | What it runs                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `npm test`             | **Unit tests** (Vitest) — colocated `*.test.js` files; mock external deps, no Docker needed.  |
| `npm run test:watch`   | Same suite in watch mode for local iteration.                                                 |
| `npm run test:db:up`   | Start the Postgres test container (required before E2E).                                      |
| `npm run test:e2e`     | **End-to-end tests** (Playwright) — drive Chromium against a real SvelteKit + Postgres stack. |
| `npm run test:db:down` | Stop + wipe the test container.                                                               |
| `npm run test:all`     | Unit then E2E in sequence.                                                                    |

First-time E2E setup: `npx playwright install chromium` (browser binaries) and `npx prisma generate` (Prisma client) from `app/`.

The E2E suite runs against a Postgres container seeded from `dev/dev-db.sql` — the same dump used for local dev. The fresher that dump is, the more representative the tests are; running them against stale seed data may pass while real production data would fail.

CI posts a coverage report on each PR, generated from the **unit** suite only (`npm test -- --coverage`). E2E tests aren't instrumented, so the percentages reflect only what the unit/Vitest tests exercise. Run locally the same way to preview the report at `app/coverage/index.html`, which is git-ignored.

## Environment variables

The webapp expects the following (referenced from `app/src/lib/server/secrets.js` and route handlers). In production these are set on the App Runner service; in local dev, set them in your shell or in `app/.env`. Note that the recurring Lambda jobs do not read these from `.env`; they pull equivalents from SSM at invocation time.

**Database**
- `DATABASE_URL` — Prisma connection string (RDS endpoint in prod; the local Postgres URL in dev, exported automatically by `dev/load-dev-db.sh`)

**Neon CRM — REST API (server-to-server)**
- `NEON_API_KEY`, `NEON_API_USER` — HTTP Basic auth used by `app/src/lib/helpers/neonHelpers.js` to look up registrants (when a registration webhook fires) and fetch a user's registrations (on `/my-classes`)

**Neon CRM — OAuth 2.0 (WIP user login)**
- `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI` — used by the `/my-classes/login/neon` flow. The OAuth token is parsed as the user's Neon ID and stored on the local `User` row; the app never makes further API calls with it.
- `REDIRECT_URI` must match exactly what's registered with Neon, e.g. `https://classes.asmbly.org/my-classes/login/neon/callback`

**Neon CRM — webhooks**
- `INTERNAL_API_KEY` — shared secret validated on `/api/class-registration` and `/api/class-cancellation`; Neon sends it in the webhook payload's `customParameters`

**Email**
- `GMAIL_USER`, `GMAIL_PASS` — Gmail account + app password used by `gmailEmailFactory.js` for transactional emails (waitlist openings, private-session requests)

**Newsletter**
- `FLO_API_KEY` — Flodesk API key for the footer newsletter signup

## CI/CD

`.github/workflows/`:

- **`build-and-push.yml`** — on push to `main` touching `app/**`, or when started by hand or by `merge-class-photos.yml`: build linux/amd64 image, push to ECR repo `classes-page` tagged `latest` and `${sha}`, with BuildKit cache pushed to a `buildcache` tag. One build runs at a time, so an older build can't push `latest` after a newer one.
- **`build-cron.yml`** — on push to `main` touching `cron-service/**`: build linux/arm64 image, push to ECR repo `classes-cron`, then deploy to Lambda function `classes-crons` via `aws-actions/aws-lambda-deploy@v1.1.0` (timeout 600s).
- **`tests.yml`** — on pull requests touching `app/**`: unit tests, then E2E tests.
- **`merge-class-photos.yml`** — after `tests.yml` passes on a pull request from the class photo upload page: merges it and starts `build-and-push.yml`. See [Class photos](#class-photos).

Both build workflows run in `us-east-2` and use AWS credentials from repo secrets.

## Class photos

Class images live in `app/src/lib/images/`. Staff change one from the class photo upload page at `https://facilities.asmbly.org/class-photo-upload` (code in [`asmbly-facilities-and-maintenance-tracking-automation`](https://github.com/asmbly-makerspace/asmbly-facilities-and-maintenance-tracking-automation)). The page checks the photo, then the `asmbly-class-photos-upload` GitHub App opens a pull request from a `class-photo/` branch. A new photo for a class with an open pull request updates that pull request.

`merge-class-photos.yml` merges these pull requests without review. When `tests.yml` passes, it runs `.github/scripts/merge-class-photo.sh` from `main`, which merges only when:

- the App opened the pull request and made every commit on it, from a `class-photo/` branch in this repo, into `main`;
- it adds or replaces exactly one `.jpg` directly in `app/src/lib/images/`, and removes only images the class list matches to the same class (the same `simplifyName` key in `neonEventInstance.js`), which is what the upload page does;
- it doesn't touch the fallback images (`classDefault.jpg`, `lasersDefault.jpg` and the other `*Default.jpg`);
- the tests passed on the pull request's current commit.

It squash-merges that commit, then starts `build-and-push.yml`, because a merge made with the workflow's token doesn't trigger push workflows. A photo is live about 20–30 minutes after it is submitted (tests, then the image build, then App Runner's deploy). A pull request someone else opened, or one that moved on after its tests, is left alone. When the App's pull request breaks any other rule, the run fails with the reason and the pull request stays open for a person.

- **To undo a photo:** submit another one, or revert the commit.
- **If a run fails after it logs `Merged #<n>`:** the photo is on `main` but wasn't deployed. Start the deploy by hand with `gh workflow run build-and-push.yml`; rerunning the failed run won't, because the pull request is already merged.
- **To review photos by hand again:** disable the workflow (`gh workflow disable merge-class-photos.yml`). Pull requests then wait for a person.
- **To see what it would do:** `REPO=asmbly-makerspace/asmbly-classes HEAD_BRANCH=<branch> HEAD_SHA=<sha> DRY_RUN=1 .github/scripts/merge-class-photo.sh` runs every check without merging.
- **If `main` gets a rule requiring reviews:** add GitHub Actions to its bypass list, or this workflow can't merge.

## Legacy / unused

These root-level files and folders are leftovers from the previous deployment model (docker-compose + Caddy on a single host with self-hosted Postgres). They are not used by the current App Runner setup and can safely be ignored — they're listed here so future contributors know not to follow them as a guide:

- `compose.yaml` — orchestrated app + db + cron + caddy on a single host. Replaced by App Runner (web), Lambda (cron), and RDS (database).
- `compose.dev.yaml` — earlier local-dev setup that ran the app inside a container. Local dev now runs the app on the host via `dev/load-dev-db.sh`.
- `caddy/` — Caddyfile that terminated TLS and reverse-proxied to `app:3000`. App Runner now handles TLS and ingress.
- `hooks.server.js` (repo root) — abandoned scaffolding for a Redis-backed page cache. Never wired into SvelteKit (the live hook is `app/src/hooks.server.js`, which handles auth) and the `redis` dependency was never added to `app/package.json`.
- `postgres_backup.sh` — one-line script that backed up the compose-managed Postgres container by name. Superseded by RDS automated snapshots.
