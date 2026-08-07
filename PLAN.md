# HRC Multi-Tenant Staff & Client Portal — Plan & Status

**Author:** [Your Name] — **Date:** [Date]
**Project:** `hrc-portal` — dedicated platform for Hedge Resource Centre (HRC)
**Status:** Core build complete and verified end-to-end. Phase 2 enhancements delivered.

---

## 1. Business Goal

One portal serving three audiences with strict access separation:

- **Admin (HRC Management)** — invite consultants, create client accounts, assign consultants to clients, oversee all projects, and review an audit trail
- **Staff / Consultants** — see only their assigned clients, update project statuses, track tasks and deliverables, upload documents, receive client requests as alerts
- **Clients** — view their assigned consultant, monitor live project progress, download shared documents, submit requests, and get notified of status changes / new documents

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Styling | Tailwind CSS v4 + Lucide icons + shadcn/ui-style components |
| Database | PostgreSQL (local Prisma Postgres dev; managed Postgres in production) via Prisma ORM v7 |
| Auth | JWT session cookies (jose, HS256) with 3 strict roles: `ADMIN`, `CONSULTANT`, `CLIENT` |
| Data layer | Prisma Client with pg driver adapter (Prisma v7 requirement) |
| Email | SMTP via Nodemailer (falls back to console logging in dev) |

## 3. Data Model (7 models, migrated)

- **User** — name, email, password hash, role (`ADMIN`/`CONSULTANT`/`CLIENT`)
- **ClientAssignment** — mapping table linking consultants to clients
- **Project** — title, description, status (`PLANNING`/`ACTIVE`/`ON_HOLD`/`COMPLETED`), created by, consultant, client
- **Task** — per-project milestones/deliverables with due dates and completion flag
- **Document** — shared files per project with uploader reference
- **Notification** — in-app alerts (client requests, status changes, new documents, assignments)
- **AuditLog** — immutable trail of administrative and project actions

## 4. Security & Access Control

- Route protection at the network boundary (Next.js `proxy.ts`): `/admin/*` → ADMIN only, `/staff/*` → CONSULTANT only, `/client/*` → CLIENT only
- Double-guarded: middleware redirects + `requireRole()` checks inside every server component/action
- Passwords hashed with bcrypt; session cookie is `httpOnly` + signed (7-day expiry)
- Data scoping: consultants only see their assigned clients/projects; clients only see their own projects; document uploads verify project membership server-side

## 5. What Was Delivered

**Admin Dashboard**
- Live stats, client & consultant management tables, "invite" flow that emails shareable credentials, consultant→client assignment UI, project creation with consultant assignment
- New: audit-log page tracking invitations, assignments, project creation/status changes, and document uploads

**Consultant Dashboard**
- "My Clients" list with per-project progress bars; project task tracker with status updates, task checkboxes, add-task
- New: document upload per project (10MB limit) with automatic client notification; in-app notification bell for client requests and new assignments

**Client Dashboard**
- Assigned consultant profile card, live project progress cards, document download list, request form
- New: notification bell for project status changes and new documents; requests automatically alert the consultant and admins

## 6. How to Run (development)

```bash
npx prisma dev --detach                  # start local database (once)
npx prisma migrate dev --name init       # create schema (once)
npx prisma db seed                       # load demo users (once)
npm run dev                              # start the app
```

**Demo accounts:** `admin@hrc.com`/`admin123` · `consultant@hrc.com`/`consultant123` · `client@hrc.com`/`client123`

## 7. Verification Completed

Automated HTTP tests confirmed: role-correct logins redirect to the right dashboard, wrong passwords are rejected, cross-role access is blocked and redirected, and all dashboards render seeded data. Uploads, notifications, and audit logging were verified through the running app.

## 8. Deployment (Phase 2)

- Vercel-ready: `postinstall` regenerates the Prisma client; `DEPLOYMENT.md` documents env vars, managed Postgres, and `prisma migrate deploy`
- Recommended production additions (not yet implemented): object-storage for uploads (S3/R2/Vercel Blob), password reset flow, rate limiting
- Pending: review the 3 high-severity advisories reported by `npm audit`

## 9. Recommended Next Phase (not yet built)

- Object storage for uploaded documents (S3 / R2 / Vercel Blob) — current uploads are local-disk only
- Password reset / change flow (invitation emails currently state it's not yet implemented)
- Email notifications in addition to in-app alerts
- Request → consultant workflow acknowledgement (mark a request as handled)
- CI pipeline that runs `prisma migrate deploy` + `next build` on merge
