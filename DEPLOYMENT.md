# Deploying the HRC Portal

The app is a Next.js 16 (App Router) project on Prisma ORM v7 with PostgreSQL.
This guide covers deploying to Vercel with a managed Postgres database.

## Environment variables

Set all of the following in your hosting provider's secret manager
(Vercel → Project → Settings → Environment Variables):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Connection string used by Prisma CLI migrations. For Prisma Postgres use the `prisma+postgres://` URL; for plain PostgreSQL any valid connection string works. |
| `DIRECT_DATABASE_URL` | Standard `postgres://` URL used by the runtime Prisma Client (pg driver adapter). **Required by the app at runtime.** |
| `SESSION_SECRET` | Random 32-byte base64url string. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `PORTAL_URL` | Public base URL, e.g. `https://hrc-portal.vercel.app` (used in invitation emails). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Optional. Without these, invitation emails are logged to the console instead of sent. |

> The repo's `.env` files are gitignored. Copy `.env.example` for local reference — it never leaves the machine.

## Why `prisma generate` runs automatically

The Prisma client is generated to `generated/prisma` (gitignored). A
`postinstall` script (`prisma generate`) regenerates it on every install, so
fresh environments (like Vercel builds) get a working client.

## Deploying to Vercel

1. Push the repository to GitHub and import it into Vercel.
2. Vercel auto-detects Next.js — no build settings changes required.
3. Add the environment variables above (build-time and runtime).
4. Before the first deploy (or whenever schema changes), create tables:

   ```bash
   # against your managed Postgres (from CI or your machine):
   npx prisma migrate deploy
   ```

5. Optionally seed initial data once:

   ```bash
   npx prisma db seed
   ```

6. Deploy.

## File uploads note

Uploads are stored on the local filesystem under `public/uploads/`. On Vercel
(serverless) the filesystem is ephemeral, so for production file persistence you
should swap `lib/uploads.ts` to write to a blob/object store (e.g. AWS S3,
Vercel Blob, Cloudflare R2) and return the object's public URL.

## Local production-like run

```bash
npm ci
npx prisma migrate deploy
npx prisma db seed
npm run build
npm start
```

## Multi-server caveats

Next.js signs server-action payloads with a per-build key. If you run multiple
server instances behind a load balancer, set
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (base64, 16/24/32 bytes) at build time so
all instances agree.
