# Neon + Vercel Deployment

## 1. Create a Neon database

1. Create a new Neon project.
2. Copy the pooled connection string.
3. Put it in your local `.env.local` as `DATABASE_URL`.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="24h"
NEXT_PUBLIC_APP_NAME="AIプラス"
```

## 2. Prepare the database locally

Run these commands after updating `.env.local`:

```bash
npm install
npm run db:deploy
npm run db:seed
```

## 3. Push to GitHub

- Use a private repository.
- Do not commit `.env` or `.env.local`.
- Treat the sample passwords in `prisma/seed.ts` as local setup data only.

## 4. Configure Vercel

Add these environment variables in Vercel for Production / Preview:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NEXT_PUBLIC_APP_NAME`

## 5. Deploy

The app build already runs `prisma generate`, so a normal Vercel deployment is enough once the database schema exists.

If this is the first deployment, run the schema deployment once from your machine first:

```bash
npm run db:deploy
```

## 6. Initial access

- Student login: `/login`
- Admin login: `/admin/login`

Create real customer accounts from the admin screen after deployment instead of sharing seed accounts.

## Notes

- This project now assumes PostgreSQL for both local and production environments.
- `proxy.ts` is used instead of deprecated `middleware.ts`.
- Current learner-facing content types are `video` and `text`.
