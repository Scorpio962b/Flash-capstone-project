# Flash-Guard Offline Runbook

## 1) What you are receiving
- A runnable **Web app** (`http://localhost:3000`)
- A runnable **Mobile-facing app UI** (`http://localhost:3001`) for Android emulator browser automation
- A runnable **API** (`http://localhost:4000`)
- A seeded **SQL Server 2022 Express** database (`localhost:1433`)

Note on container ports:

- The web and mobile containers serve on port `80` inside the container; Docker Compose maps those to host ports via `WEB_PORT` and `MOBILE_PORT` from your `.env` (defaults: `3000` and `3001`).
- The API listens on `API_PORT` (default `4000`) on the host via Compose mapping. If you see containers reporting `:80` in logs, access the service using the host port shown in `.env` (for example `http://localhost:3000`).

## 2) Start the system under test
1. Copy `.env.example` to `.env` and adjust passwords if needed.
2. Run:
   - `npm run stack:up`
3. Validate API:
   - `npm run api:health`

## 3) Reset to golden state
- Run:
  - `npm run db:reset-seed`
- This re-applies deterministic demo data so each student run starts clean.

## 4) Student execution targets
- Playwright targets: `http://localhost:3000`
- Newman targets: `http://localhost:4000`
- Android emulator targets:
  - app/mobile web: `http://10.0.2.2:3001`
  - API: `http://10.0.2.2:4000`
- SQL validation targets: `FlashGuard` DB on `localhost:1433`

## 5) Key seeded users
- `alice@flashguard.local` (active, sender account)
- `bob@flashguard.local` (active, recipient account)
- `charlie@flashguard.local` (inactive/blocked scenarios)

## 6) Useful API flows for assignments
- `POST /auth/login`
- `POST /transactions/transfer`
- `POST /transactions/transfer/{id}/authorize`
- `GET /transactions/history`
- `GET /audit-logs`
- `GET /compliance-checks`

## 7) Shut down
- `npm run stack:down`
