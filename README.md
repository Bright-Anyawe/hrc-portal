# HRC Portal

A multi-tenant staff & client portal for **Hedge Resource Centre (HRC)**. One application serving three audiences — HRC management, consultants, and clients — with strict access separation between them.

## Features

### Admin Dashboard (`/admin`)
- Live stats and management tables for clients and consultants
- Invite flow that emails sign-in credentials to new users
- Consultant-to-client assignment UI
- Project creation with consultant and client assignment
- Full audit log tracking invitations, assignments, project changes, and document uploads
- Role promotion between client and consultant

### Staff / Consultant Dashboard (`/staff`)
- "My Clients" list with per-project progress bars
- Project task tracker with status updates, task checkboxes, and add-task
- Document upload per project (10 MB limit) with automatic client notification
- Notification bell for client requests and new assignments

### Client Dashboard (`/client`)
- Assigned consultant profile card and live project progress cards
- Document download list
- Request submission form that alerts the consultant and admins
- Notification bell for project status changes and new documents
- Invoice view with line items, status and payment history
- **Pay Now** — online payment via Paystack (secure, server-verified checkout)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Styling | Tailwind CSS v4, Lucide icons, shadcn/ui-style components |
| Database | PostgreSQL via Prisma ORM v7 (pg driver adapter) |
| Auth | JWT session cookies (`jose`, HS256) with roles `ADMIN` / `CONSULTANT` / `CLIENT`; email + password and Google OAuth |
| Email | SMTP via Nodemailer (falls back to console logging in dev) |
| Data fetching | TanStack React Query |

## Data Model

Seven models (see `prisma/schema.prisma`):

- **User** — name, email, password hash / Google ID, role, relations
- **ClientAssignment** — mapping table linking consultants to clients
- **Project** — title, description, status (`PLANNING` / `ACTIVE` / `ON_HOLD` / `COMPLETED`), created by, consultant, client
- **Task** — per-project milestones/deliverables with due dates and completion flag
- **Document** — shared files per project with the uploading user
- **Notification** — in-app alerts (client requests, status changes, new documents, assignments)
- **AuditLog** — immutable trail of administrative and project actions
- **Invoice** / **InvoiceLineItem** — bills per project with line items, status (`DRAFT` / `SENT` / `PAID` / `CANCELLED`), due date and note
- **Payment** — recorded Paystack transactions per invoice (reference, amount, channel, status, timestamps)

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A PostgreSQL database (or a local Prisma Postgres instance)

### Setup

```bash
# 1. Install dependencies (runs `prisma generate` automatically)
npm install

# 2. Copy the environment template and fill in the values
cp .env.example .env

# 3. Start the local database (once)
npx prisma dev --detach

# 4. Apply migrations
npx prisma migrate dev

# 5. Seed demo users
npx prisma db seed

# 6. Run the app
npm run dev
```

Open http://localhost:3000.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hrc.com` | `admin123` |
| Consultant | `consultant@hrc.com` | `consultant123` |
| Client | `client@hrc.com` | `client123` |

### Environment variables

See `.env.example` for all variables with explanations:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Connection string for Prisma CLI migrations |
| `DIRECT_DATABASE_URL` | Standard `postgres://` URL used by the runtime Prisma Client (pg driver adapter) |
| `SESSION_SECRET` | Secret for signing session JWTs (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials (Sign in with Google) |
| `PORTAL_URL` | Public base URL, used in invitation emails |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Optional SMTP settings; without them, invitation emails are logged to the console |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (`sk_test_...` in test mode, `sk_live_...` in live mode). Server-side only — never exposed to the browser. Switching test ↔ live is swapping this key |
| `PAYSTACK_CURRENCY` | Currency invoices are billed in (default `USD`). Paystack charges in the currency's smallest unit, which maps 1:1 to the invoice's stored cents for USD |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run db:migrate` | Create / apply schema migrations (`prisma migrate dev`) |
| `npm run db:deploy` | Apply migrations in production (`prisma migrate deploy`) |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## Security & Access Control

- Route protection at the network boundary (`proxy.ts`): `/admin/*` → ADMIN only, `/staff/*` → CONSULTANT only, `/client/*` → CLIENT only, plus `requireRole()` checks inside every server component and action.
- Passwords hashed with bcrypt; session cookie is `httpOnly` and signed (7-day expiry).
- Data scoping: consultants see only their assigned clients/projects; clients see only their own projects; document uploads verify project membership server-side.

## Paystack Online Payments

Clients pay sent invoices directly from the Client Portal (`/client/invoices/[id]`). The flow:

1. Client opens an invoice with status `SENT` and clicks **Pay Now**.
2. The server (`app/actions/payments.ts` → `lib/payments.ts`) verifies the session, invoice ownership, that the invoice is payable, that it isn't already paid, and recomputes the total from the DB.
3. The server creates a `PENDING` payment record and calls Paystack `transaction/initialize` with a unique reference and a callback URL. The client is redirected to Paystack Checkout.
4. Paystack redirects the client back to `/client/invoices/[id]/result`, which re-verifies the transaction server-side (`transaction/verify`), cross-checks the amount and currency against the invoice, records the payment (`SUCCESS`), marks the invoice `PAID`, notifies the client + admins, logs an audit entry, and emails a receipt.
5. A webhook at `POST /api/paystack/webhook` receives `charge.success` events (HMAC-SHA512 signature-verified) and settles the payment the same way — making confirmation reliable even if the client closes the browser before the redirect.

Security notes:

- The secret key lives only in `PAYSTACK_SECRET_KEY` (server-side). No Paystack credentials are sent to the browser; the checkout runs entirely on Paystack's hosted page.
- Amount and currency are re-derived from the database and compared against Paystack's verified response before an invoice is marked paid.
- Settling is idempotent — concurrent webhook + redirect calls only mark the payment paid once.

### Set-up

1. Create an account at https://dashboard.paystack.com and add your card details for test mode.
2. Copy test keys from **Settings → API Keys & Webhooks** (`sk_test_...`).
3. Set `PAYSTACK_SECRET_KEY` (and optionally `PAYSTACK_CURRENCY`) in `.env`.
4. Register the webhook URL `https://<your-domain>/api/paystack/webhook` in the Paystack dashboard (enable the `charge.success` event).
5. Send an invoice from the admin portal; the client will see **Pay Now**.

## Project Structure

```
app/          # App Router pages and layouts per role
components/   # Shared + role-specific React components
lib/          # auth, rbac, audit, notifications, mailer, uploads, prisma client
prisma/       # Schema, migrations, seed script
public/       # Static assets incl. uploaded documents
generated/    # Generated Prisma client (gitignored)
```

## Deployment

See `DEPLOYMENT.md` for Vercel deployment instructions, managed Postgres setup, environment variables, and production caveats.

> Note: Uploads are stored on the local filesystem under `public/uploads/`. On serverless platforms (e.g. Vercel) the filesystem is ephemeral — swap `lib/uploads.ts` to write to a blob/object store (AWS S3, Vercel Blob, Cloudflare R2) for production file persistence.