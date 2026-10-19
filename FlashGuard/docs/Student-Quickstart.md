**Quickstart**
- **Start stack**: `npm run stack:up` (builds and starts containers, seeds DB, then starts Expo interactive mobile runner)
- **Start containers only**: `npm run stack:up:containers`
- **Seed DB (reliable)**: `npm run db:reset-seed` or run `docker compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'YourStrong!Passw0rd' -d FlashGuard -i /workspace/db/init/99-reset-and-seed.sql -b`

Local DB (host)
- If you prefer to run SQL Server locally (outside Docker) and let the containers connect to it, initialize the DB from the repo SQL files:
	- PowerShell:
		```powershell
		pwsh .\scripts\init-local-db.ps1 -Server 'localhost' -User 'sa' -Password 'YourStrong!Passw0rd' -Port 1433
		```
	- Batch (Windows):
		```bat
		.\scripts\init-local-db.bat
		```
- The init scripts create the `FlashGuard` database and seed data. When starting containers that should connect to the host SQL Server, use `host.docker.internal` as `DB_HOST` (or set `DB_HOST` in `.env`).
- Start app services (API, web, mobile) only — the Docker SQL Server service was removed from the compose file:
	```bash
	docker-compose up -d api web mobile
	```

Notes:
- Web app: `http://localhost:3000` · API: `http://localhost:4000`
- Test tooling (Playwright, Newman, Appium, SQL scripts) is yours to set up under `tests/`.
