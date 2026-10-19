# TaskFlow API

A learning-focused, production-style project/task management REST API using Express, MongoDB, Redis, BullMQ, Docker Compose, Nginx, tests, and GitHub Actions.

> This is a portfolio starter, not a fully audited production service. Before real production use, finish the hardening checklist below (SMTP adapter, refresh-token device/session model, backups, TLS/domain config, monitoring, secrets management, and deployment rollback).

## Requirements

- Docker Desktop (or Docker Engine + Compose)
- Git
- Optional: Node.js 20+ if running the API outside Docker

## Run locally with Docker

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   On Windows PowerShell: `Copy-Item .env.example .env`
2. Replace both JWT secrets in `.env` with long random values (32+ characters).
3. Start all services:
   ```bash
   docker compose up --build
   ```
4. Test:
   ```bash
   curl http://localhost/health/live
   curl http://localhost/health/ready
   ```
   API is proxied through Nginx at `http://localhost`.

Stop:
```bash
docker compose down
```
Stop and remove local database volumes (DELETES local data):
```bash
docker compose down -v
```

## Local run without Docker (optional)

Start MongoDB and Redis separately, set `MONGODB_URI=mongodb://127.0.0.1:27017/taskflow`, `REDIS_HOST=127.0.0.1`, install dependencies with `npm install`, then run `npm run dev`. Run the worker in another terminal with `npm run worker`.

## API overview

All routes are under `/api/v1`. Protected routes require:
`Authorization: Bearer <accessToken>`

### Auth
- `POST /api/v1/auth/register` — `{ "name":"Rahim", "email":"rahim@example.com", "password":"a-long-password" }`
- `POST /api/v1/auth/login` — `{ "email":"rahim@example.com", "password":"a-long-password" }`
- `POST /api/v1/auth/refresh` — `{ "refreshToken":"..." }`
- `POST /api/v1/auth/logout` — protected; invalidates the current stored refresh token
- `GET /api/v1/auth/me` — protected

Registration/login returns `{ data: { user, accessToken, refreshToken } }`. For this demo, tokens are returned in JSON; browser apps should consider secure, HttpOnly, SameSite cookies and CSRF protections.

### Projects
- `GET /api/v1/projects?page=1&limit=10`
- `POST /api/v1/projects` — `{ "name":"Website", "description":"Redesign project" }`
- `GET /api/v1/projects/:projectId`
- `PATCH /api/v1/projects/:projectId`
- `DELETE /api/v1/projects/:projectId` — also deletes its tasks

### Tasks
- `GET /api/v1/projects/:projectId/tasks?status=todo&priority=high&search=login&page=1&limit=10`
- `POST /api/v1/projects/:projectId/tasks` — `{ "title":"Build login", "priority":"high" }`
- `PATCH /api/v1/projects/:projectId/tasks/:taskId`
- `DELETE /api/v1/projects/:projectId/tasks/:taskId`

Task status: `todo`, `in_progress`, `done`. Priority: `low`, `medium`, `high`.

## Try it with curl

Register and copy the `accessToken` from the response:
```bash
curl -X POST http://localhost/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Rahim","email":"rahim@example.com","password":"this-is-a-long-password"}'
```

Use that token to create a project:
```bash
curl -X POST http://localhost/api/v1/projects \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -d '{"name":"My first project","description":"Learning backend"}'
```

Use the returned project `_id` to create a task:
```bash
curl -X POST http://localhost/api/v1/projects/PROJECT_ID/tasks \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -d '{"title":"Learn Express routes","priority":"high"}'
```

## Architecture

- **Nginx**: port 80 reverse proxy and basic request-rate limit.
- **Express API**: auth, validation, routing, business logic.
- **MongoDB**: persistent users, projects, tasks.
- **Redis**: project-list cache and BullMQ queue backend.
- **BullMQ worker**: processes welcome-email demo jobs.
- **Docker Compose**: isolated services, health checks, persistent volumes.
- **GitHub Actions**: CI workflow runs tests on pushes and pull requests.

## Git workflow

```bash
git init
git add .
git commit -m "chore: initial TaskFlow API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflow-api.git
git push -u origin main
```

## Important production hardening checklist

- [ ] Use a real secret manager; never commit `.env`.
- [ ] Add real SMTP/email provider adapter and verify delivery/retries.
- [ ] Add rate limits specific to login/register and abuse monitoring.
- [ ] Consider refresh-token sessions per device, rotation/reuse detection, and secure HttpOnly cookies for browsers.
- [ ] Add authorization tests, service/integration tests, and coverage thresholds.
- [ ] Add database backups, restore drills, indexes review, and migration strategy.
- [ ] Configure a real domain and TLS certificate (e.g. automated ACME/Let's Encrypt); current Nginx config is HTTP-only.
- [ ] Add metrics, structured logs, alerting, and error tracking.
- [ ] Configure SSH-only firewall, non-root deploy user, secret handling, and rollback strategy on VPS.
- [ ] Review CORS, proxy trust, request limits, dependency updates, and security headers for your exact deployment.
- [ ] Add team membership/role rules before exposing shared projects. Current model is owner-only.
- [ ] Configure CI to build and publish a container image and deploy to a VPS using GitHub secrets; current workflow runs CI tests only.

## Troubleshooting

- If port 80 is in use, stop the conflicting service or change the Nginx host mapping.
- If containers start before dependencies are ready, check `docker compose logs api mongo redis worker`.
- To see worker jobs: `docker compose logs -f worker`.
- If config changes, restart services: `docker compose up --build`.
