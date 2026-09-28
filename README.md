# Barber booking

## Development

Requirements: Node.js 24 and Docker Desktop.

1. Copy `docker.env.example` to `.env` and fill in the PostgreSQL and LINE settings. Use `DATABASE_URL=postgresql://<user>:<password>@localhost:55433/<database>` and `APP_URL=http://localhost:3000`.
2. Start PostgreSQL: `docker compose up -d db`.
3. Install dependencies if needed: `npm install`.
4. Apply database migrations: `npx prisma migrate dev`.
5. Generate Prisma Client if needed: `npm run db:generate`.
6. Start Next.js locally: `npm run dev`.
7. Open http://localhost:3000/login.

Next.js reloads after code changes. You do not need to rebuild a Docker image while developing. To use pgAdmin, run `docker compose --profile dev up -d pgadmin-dev` and open http://localhost:5051.

## Admin

For the first admin, sign in with LINE once. The bootstrap response shows the LINE user ID. Set `LINE_ADMIN_USER_ID` in your local `.env`, run `npm run db:seed-admin`, then sign in again. Admin pages start at `/admin` and include bookings, services, shop hours and holidays, and user roles. The `.env` file stays local and is ignored by Git.

## Structure

- `src/app/(customer)` and `src/app/(admin)` contain the customer and admin pages. Their server components load initial data and pass it to views as props.
- `src/views/customer`, `src/components/customer`, and `src/api-clients/customer` contain customer UI and browser requests. The corresponding `admin` folders contain admin UI and browser requests.
- `src/app/api/(customer)` contains customer mutations and the availability endpoint. `src/app/api/admin` contains admin mutations. Route groups do not change the public API URLs.
- `src/features`, `src/repositories`, `src/contracts`, and `src/types` contain business rules, database access, input/output validation, and shared types. Browser requests are used for interactions after initial rendering.
- `styles/app/shell.module.css` defines the shared customer/admin shell and responsive header.

## Tests

Run the booking rules and code checks with `npm run test:booking`, `npm run lint`, `npm run format:check`, and `npm run build`. Use `npm run format` to apply the shared formatting rules.

The integration and HTTP tests require a disposable PostgreSQL database named `barber_test`. For example, start one on local port 55434 with:

```powershell
docker run --rm -d --name barber-booking-test-db -e POSTGRES_USER=barber_test -e POSTGRES_PASSWORD=barber_test -e POSTGRES_DB=barber_test -p 127.0.0.1:55434:5432 postgres:17-alpine
$env:DATABASE_URL='postgresql://barber_test:barber_test@127.0.0.1:55434/barber_test'
npx prisma migrate deploy
npm run test:integration
```

For HTTP, responsive browser, and performance tests, start the built app in a second terminal with the same `DATABASE_URL`, plus `AUTH_SECRET` (at least 32 characters) and `APP_URL='http://localhost:3001'`, then run `npm run start -- -p 3001`. Run `npm run test:http`, `npm run test:responsive`, or `npm run test:performance` in the first terminal with those same environment values. The responsive and performance tests use installed Chrome (override with `CHROME_PATH`); responsive screenshots are saved under `test-results/responsive`. The performance test warms each route, measures bounded HTTP load on customer and admin pages and the availability API, then sends 12 simultaneous bookings for one slot and checks that exactly one succeeds. Its local throughput and timing figures are for comparison on the same machine, not a production capacity target. Stop the disposable database afterward with `docker stop barber-booking-test-db`.

The LINE HTTP test checks the authorization redirect and rejects an invalid callback. Completing a real LINE login requires a browser and valid LINE credentials.
