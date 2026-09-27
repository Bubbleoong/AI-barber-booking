# Barber booking

## Development

Requirements: Node.js 24 and Docker Desktop.

1. Copy `docker.env.example` to `.env` and fill in the PostgreSQL and LINE settings. Use `DATABASE_URL=postgresql://<user>:<password>@localhost:55433/<database>` and `APP_URL=http://localhost:3000`.
2. Start PostgreSQL: `docker compose up -d db`.
3. Install dependencies if needed: `npm install`.
4. Generate Prisma Client if needed: `npm run db:generate`.
5. Start Next.js locally: `npm run dev`.
6. Open http://localhost:3000/login.

Next.js reloads after code changes. You do not need to rebuild a Docker image while developing. To use pgAdmin, run `docker compose --profile dev up -d pgadmin-dev` and open http://localhost:5051.