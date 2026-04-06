# Asmbly Classes

A web application for managing and displaying classes at [Asmbly Makerspace](https://asmbly.org). This system integrates with Neon CRM to sync class data and provides a user-friendly interface for browsing and registering for classes.

**Live site:** [classes.asmbly.org](https://classes.asmbly.org)

## Tech Stack

- **Frontend:** SvelteKit 2, Svelte 4, TailwindCSS, DaisyUI
- **Backend:** SvelteKit server-side, Node.js
- **Database:** PostgreSQL 16 with Prisma ORM
- **Cron Jobs:** AWS Lambda handlers for scheduled tasks
- **Reverse Proxy:** Caddy (with automatic HTTPS)
- **Infrastructure:** Docker Compose, AWS (ECR, CloudWatch Logs, SSM Parameter Store)

## Project Structure

```
├── app/                    # Main SvelteKit application
│   ├── prisma/            # Prisma schema and migrations
│   ├── src/
│   │   ├── lib/           # Shared utilities and models
│   │   │   ├── models/    # Neon event types and instances
│   │   │   ├── server/    # Server-only code (auth, API calls, secrets)
│   │   │   └── helpers/   # Helper functions
│   │   └── routes/        # SvelteKit routes
│   │       ├── (data-pages)/   # Dynamic pages (my-classes, events)
│   │       ├── (prerendered)/  # Static pages (FAQ, mentor series)
│   │       └── api/            # API endpoints (registration, cancellation)
│   └── package.json
├── cron-service/          # AWS Lambda cron handlers
│   ├── prisma/            # Cron-specific database operations
│   │   ├── dailyClassMaintenance.js   # Syncs classes from Neon
│   │   ├── weeklyReportingMetrics.js  # Weekly reports
│   │   └── seed.js                    # Database seeding
│   └── handler.js         # Lambda entry point
├── caddy/                 # Caddy reverse proxy config
├── compose.yaml           # Production Docker Compose
├── compose.dev.yaml       # Development Docker Compose
└── secrets/               # Local secrets (gitignored)
```

## Prerequisites

- Docker and Docker Compose (all services run in containers - no local Node.js required)
- Access to Neon CRM API credentials (for full functionality)

## Local Development Setup (Dockerized)

All development runs inside Docker containers. You don't need Node.js installed locally.

### 1. Clone the repository

```bash
git clone git@github.com:asmbly-makerspace/asmbly-classes.git
cd asmbly-classes
```

### 2. Set up secrets

Create the `secrets/` directory with required credentials:

```bash
mkdir -p secrets
echo "your_postgres_user" > secrets/postgres-user.txt
echo "your_postgres_password" > secrets/postgres-password.txt
```

### 3. Create environment file

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@db:5432/asmbly_classes
NEON_API_KEY=your_neon_api_key
NEON_API_USER=your_neon_api_user
GMAIL_USER=your_gmail_user
GMAIL_PASS=your_gmail_app_password
```

### 4. Start development environment

```bash
docker compose -f compose.dev.yaml up --build
```

This starts:
- **PostgreSQL database** on port 5432
- **SvelteKit dev server** on http://localhost:5173 (with hot reload)
- **Cron service** for scheduled tasks

### 5. Run database migrations

```bash
docker compose -f compose.dev.yaml exec app npx prisma migrate dev
```

### 6. Seed the database (optional)

```bash
docker compose -f compose.dev.yaml exec app npx prisma db seed
```

## Running Commands (via Docker)

All commands run inside the Docker container. Use `docker compose exec` to execute them:

```bash
# Run tests
docker compose -f compose.dev.yaml exec app npm test

# Run linter
docker compose -f compose.dev.yaml exec app npm run lint

# Format code
docker compose -f compose.dev.yaml exec app npm run format

# Build for production
docker compose -f compose.dev.yaml exec app npm run build

# Open Prisma Studio (database GUI)
docker compose -f compose.dev.yaml exec app npx prisma studio
```

### Available npm scripts (inside container)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (auto-started by container) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests with Vitest |
| `npm run lint` | Run ESLint and Prettier checks |
| `npm run format` | Format code with Prettier |

## Architecture Overview

### Data Flow

1. **Neon CRM** stores the source of truth for class data
2. **Cron service** (`dailyClassMaintenance.js`) syncs data from Neon to PostgreSQL
3. **SvelteKit app** reads from PostgreSQL and renders the class catalog
4. **User registrations** are handled via API routes that communicate with Neon

### Key Models

- `NeonEventType` - Class templates (e.g., "Laser Cutter Basics")
- `NeonEventInstance` - Specific scheduled class sessions
- `NeonEventCategory` - Class categories for organization
- `NeonEventTeacher` - Instructor information
- `User` / `Session` - Authentication via Neon OAuth

### Authentication

The app uses Neon OAuth for user authentication, allowing members to view their registered classes via the `/my-classes` route.

## Production Deployment

Production uses Docker Compose with:
- Pre-built images from AWS ECR
- Caddy for automatic HTTPS on `classes.asmbly.org`
- AWS CloudWatch for logging
- AWS SSM Parameter Store for secrets

```bash
docker compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run tests (`npm run test`) and linting (`npm run lint`)
5. Commit your changes with descriptive messages
6. Push to your fork and open a Pull Request

### Code Style

- Use Prettier for formatting (run `npm run format`)
- Follow existing patterns in the codebase
- Add tests for new functionality

## License

This project is maintained by [Asmbly Makerspace](https://asmbly.org).
