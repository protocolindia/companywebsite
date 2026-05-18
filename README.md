# Company Registration & Support Services Platform

A full-stack Next.js application for company registration services with user portal, admin backend, document workflow, and email notifications.

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (credentials)
- **Email:** Brevo (Sendinblue) — pluggable
- **Storage:** Local filesystem → swappable to Cloudflare R2
- **Styling:** Tailwind CSS
- **Deploy:** Railway

## Features

### User Portal
- Register / login
- Browse services (Pvt Ltd, LLP, GST, etc.)
- Submit applications with required documents
- Track application status in real-time
- Re-upload documents when admin requests changes
- Receive email notifications at each step

### Admin Dashboard
- View all applications with filters (status, service, date)
- Open individual application case files
- Per-document actions: **Approve / Reject / Request Re-upload** with reason
- Move applications through workflow stages
- Manage services and document requirements
- Manage users
- Customize email templates
- Configure storage and email providers from Settings UI

### Document Workflow (per document)
```
pending → uploaded → [admin reviews]
                      ├── approved
                      ├── rejected (terminal)
                      └── reupload_requested → user re-uploads → back to uploaded
```

### Application Workflow (overall)
```
draft → submitted → under_review → docs_pending → approved → filed → completed
                                                  └── rejected
```

Every state change triggers an email + writes to audit log.

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET at minimum

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Seed (creates admin user + sample services)
npm run seed

# 5. Start dev server
npm run dev
```

Default admin login after seed:
- Email: `admin@example.com`
- Password: `admin123` *(change immediately)*

---

## Railway Deployment

1. **Create Railway project** → add a PostgreSQL plugin
2. **Connect GitHub repo** to Railway
3. **Set environment variables** in Railway dashboard (see `.env.example`)
   - `DATABASE_URL` — auto-populated from the Postgres plugin
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your Railway domain
   - Leave Brevo / R2 vars empty initially; configure them later from `/admin/settings`
4. **Build command:** `npm run build` (already set in `railway.toml`)
5. **Start command:** `npm run start`
6. Migrations run automatically on deploy via the `postinstall` hook

**File storage on Railway:** local storage works but is **ephemeral** — files lost on redeploy. Use it for testing only; switch to R2 for production via `/admin/settings/storage`.

---

## Switching to Cloudflare R2

1. Create R2 bucket in Cloudflare dashboard
2. Generate R2 API token (Access Key + Secret)
3. Go to `/admin/settings/storage` and fill in:
   - Account ID
   - Access Key ID
   - Secret Access Key
   - Bucket name
   - Public URL (if bucket is public)
4. Set provider dropdown to **Cloudflare R2** → Save
5. Existing local files are *not* migrated automatically — run `npm run migrate:storage` to move them

---

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Landing, services, contact
│   ├── (auth)/             # Login, register
│   ├── (user)/             # User dashboard, applications
│   ├── admin/              # Admin dashboard + settings
│   └── api/                # API routes
├── lib/
│   ├── prisma.ts           # DB client
│   ├── auth.ts             # NextAuth config
│   ├── email/              # Email service (Brevo + abstraction)
│   ├── storage/            # Storage service (Local + R2)
│   ├── workflow.ts         # State machine for apps & docs
│   └── settings.ts         # Runtime settings loader
└── components/             # Reusable UI
```

## Key Design Decisions

- **Settings stored in DB, not env.** Brevo/R2 creds live in a `Setting` table so admins can change them from the UI without redeploy. Env vars are fallback defaults only.
- **Storage is an interface.** `lib/storage/index.ts` exposes `upload()`, `getUrl()`, `delete()` — implementations swap based on the active provider.
- **Email is template-driven.** Templates stored in DB, edited from `/admin/emails`. The Brevo client just renders + sends.
- **Audit everything.** Every status change writes to `StatusHistory` with actor, timestamp, and reason.
