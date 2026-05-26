# Flacron GameZone

A full-stack football streaming and analytics platform. Watch live matches, follow leagues and teams, get AI-generated match previews and summaries, and manage everything through a built-in admin panel.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [External Integrations](#external-integrations)
  - [Football Data API](#football-data-api)
  - [Stripe Billing](#stripe-billing)
  - [AI (OpenAI)](#ai-openai)
  - [YouTube Streams](#youtube-streams)
  - [Email (Brevo)](#email-brevo)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Admin Panel](#admin-panel)
- [Background Jobs](#background-jobs)
- [Deployment](#deployment)
- [Security Notes](#security-notes)

---

## Overview

Flacron GameZone provides:

- **Live match scores** synced from the Football API with Redis caching
- **Live stream embedding** sourced automatically from YouTube
- **AI match analysis** — pre-match previews and post-match summaries in English and French
- **League standings, fixtures, and results**
- **Subscription billing** via Stripe (monthly and yearly plans)
- **Admin panel** for managing leagues, teams, matches, streams, and users

All features degrade gracefully when third-party API keys are absent, so the project runs locally with no external dependencies configured.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Cache | Upstash Redis (REST API) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Billing | Stripe Checkout + Webhooks |
| AI | OpenAI via Vercel AI SDK |
| Football Data | API-Football (primary), SportMonks (fallback) |
| Streams | YouTube Data API v3 |
| Email | Brevo (contact form) |

---

## Project Structure

```
flacron-gamezone/
├── backend/                  # Express API
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── src/
│       ├── config/           # Environment config
│       ├── controllers/      # Request handlers
│       ├── cron/             # Background jobs
│       ├── lib/              # Prisma & Redis clients
│       ├── middleware/       # Auth, error handling, validation
│       ├── repositories/     # Database access layer
│       ├── routes/           # Express routers
│       ├── services/         # Business logic
│       └── types/            # Shared TypeScript types
│
├── web/                      # Next.js frontend
│   ├── app/                  # Next.js App Router pages
│   ├── entities/             # Domain models & UI (league, match, team, stream, user)
│   ├── features/             # Feature modules (auth, billing, search, admin-*)
│   ├── page-components/      # Full page components
│   ├── shared/               # API client, utilities, shared UI
│   └── widgets/              # Composite UI blocks (shell, stats cards)
│
└── docker-compose.yml        # PostgreSQL service
```

---

## Prerequisites

- **Node.js** 18 or higher (20 recommended)
- **Docker Desktop** (for the local PostgreSQL container)
- **npm** or **pnpm**

---

## Quick Start

### 1. Start the database

```bash
docker compose up -d postgres
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The API will be available at `http://localhost:4000`.

### 3. Set up the web frontend

```bash
cd ../web
cp .env.example .env.local
npm install
npm run dev
```

The web app will be available at `http://localhost:3000`.

### 4. (Optional) Seed demo data

```bash
cd backend
npx tsx src/seed.ts
```

This creates a demo league, two teams, a match, and a placeholder stream.

### 5. Create an admin user

1. Sign up via the web UI at `/signup`
2. Open Prisma Studio: `cd backend && npx prisma studio`
3. Find your user in the `User` table and change `role` from `USER` to `ADMIN`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Server port (default: `4000`) |
| `NODE_ENV` | Yes | `development` or `production` |
| `FRONTEND_ORIGIN` | Yes | CORS origin (e.g. `http://localhost:3000`) |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis REST token |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `STRIPE_PRICE_MONTHLY` | No | Stripe price ID for monthly plan |
| `STRIPE_PRICE_YEARLY` | No | Stripe price ID for yearly plan |
| `API_FOOTBALL_KEY` | No | API-Football key |
| `API_FOOTBALL_BASEURL` | No | API-Football base URL |
| `API_SPORT_MONKS_KEY` | No | SportMonks key (fallback) |
| `API_SPORT_MONKS_BASEURL` | No | SportMonks base URL (fallback) |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features |
| `OPENAI_MODEL` | No | Model name (default: `gpt-4o-mini`) |
| `YOUTUBE_API_KEY` | No | YouTube Data API v3 key |
| `BREVO_API_KEY` | No | Brevo key for contact form emails |
| `CONTACT_FORM_TO_EMAIL` | No | Recipient address for contact form |
| `CONTACT_FORM_FROM_EMAIL` | No | Sender address for contact form |
| `CONTACT_FORM_FROM_NAME` | No | Sender display name |

### Web Frontend (`web/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | Yes | Backend URL (e.g. `http://localhost:4000`) |

> **Note:** All external integrations are optional for local development. The app falls back to mock data or disables the relevant feature when keys are missing.

---

## Database Setup

The schema is managed with Prisma. The main models are:

| Model | Description |
|---|---|
| `User` | Accounts with `USER` or `ADMIN` roles |
| `Subscription` | Stripe subscription state per user |
| `League` | Football competitions |
| `Team` | Football clubs |
| `Match` | Fixtures with status (`UPCOMING`, `LIVE`, `FINISHED`) |
| `Stream` | Embed stream linked to a match |
| `AISummary` | Cached AI preview/summary per match and language |

**Apply schema to the database:**

```bash
npx prisma db push        # development (no migration files)
npx prisma migrate dev    # production-style with migration history
```

**Open the database GUI:**

```bash
npx prisma studio
```

---

## External Integrations

### Football Data API

Live match data is fetched from [API-Football](https://www.api-sports.io/). If unavailable or unconfigured, the backend falls back to [SportMonks](https://www.sportmonks.com/).

- Live fixtures are cached in Redis for 30 seconds to avoid hammering the API
- The sync cron job runs every 5 minutes in production
- Stale `LIVE` matches that no longer appear in the API are automatically marked `FINISHED`

### Stripe Billing

Premium subscriptions are handled via Stripe Checkout. To enable locally:

```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:4000/api/billing/webhook
```

Configure the following webhook events in your Stripe dashboard:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### AI (OpenAI)

AI previews (pre-match) and summaries (post-match) are generated via the Vercel AI SDK using OpenAI. Results are:

- Cached in Redis for 24 hours
- Persisted in the `AISummary` table to avoid regeneration
- Supported in English (`en`) and French (`fr`)
- Only accessible to premium users and admins

If `OPENAI_API_KEY` is not set, AI endpoints return a placeholder response.

### YouTube Streams

Live stream URLs are found automatically by searching YouTube for `"<home team> vs <away team> live"`. The service:

- Searches only for embeddable, live-type videos
- Respects a 2-hour cooldown per match before re-searching
- Stops all searches for the rest of the day if the daily quota is exceeded
- Runs a refresh cycle every 6 minutes in production

### Email (Brevo)

The contact form submits to `/api/contact`, which sends an email via [Brevo](https://www.brevo.com/). Rate limited to 5 submissions per IP per 15 minutes.

---

## Architecture

### Authentication

JWT-based. Tokens are issued on login/signup and must be sent as `Authorization: Bearer <token>`. Middleware enforces three access levels:

- **Public** — anyone
- **Authenticated** — valid JWT required
- **Admin** — valid JWT + `role === ADMIN`
- **Premium** — valid JWT + active Stripe subscription (or admin)

### Caching

Redis is used for:

- Live fixture responses (30 s TTL)
- League and team lists from external APIs (5–10 min TTL)
- AI-generated content (24 h TTL)
- Match data from the Football API (2 min TTL)

The app functions without Redis; all cache reads return `null` and fall through to the database or API.

### Request Flow

```
Client → Next.js → /api/* → Express Backend → Prisma → PostgreSQL
                                           ↕
                                      Redis Cache
                                           ↕
                                  Football API / OpenAI / YouTube
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register a new user |
| POST | `/auth/login` | Public | Log in, receive JWT |

### Public Data
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/leagues` | Public | List all leagues |
| GET | `/leagues/:id` | Public | League details + standings + fixtures |
| GET | `/teams` | Public | List all teams |
| GET | `/teams/:id` | Public | Team details + match history |
| GET | `/matches` | Public | List matches (filter by status, date, league, team) |
| GET | `/matches/live` | Public | Live matches only |
| GET | `/matches/:id` | Optional | Match detail (stream + AI hidden for free users) |
| GET | `/streams/:id/status` | Public | Stream availability for a match |
| GET | `/search?q=` | Public | Search leagues, teams, and matches |

### Billing
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/billing/checkout` | User | Create Stripe Checkout session |
| GET | `/billing/subscription` | User | Get current subscription |
| POST | `/billing/cancel` | User | Cancel subscription |
| POST | `/billing/reactivate` | User | Undo scheduled cancellation |
| POST | `/billing/portal` | User | Open Stripe billing portal |
| POST | `/billing/webhook` | Stripe | Handle Stripe webhook events |

### AI (Premium)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/ai/preview` | Premium | Generate or fetch match preview |
| POST | `/ai/summary` | Premium | Generate or fetch match summary |
| GET | `/ai/:matchId` | Premium | Get all AI content for a match |

### Admin
All admin routes require `Authorization: Bearer <admin-token>` and are prefixed with `/api/admin`.

| Resource | Endpoints |
|---|---|
| Leagues | `GET/POST /leagues`, `PUT/DELETE /leagues/:id`, `POST /leagues/bulk-sync` |
| Teams | `GET/POST /teams`, `PUT/DELETE /teams/:id` |
| Matches | `GET/POST /matches`, `PUT/DELETE /matches/:id`, `POST /matches/sync-live` |
| Streams | `GET/POST /streams`, `PUT/DELETE /streams/:matchId`, `POST /streams/bulk-youtube-search` |
| AI | `POST /ai/preview`, `POST /ai/summary`, `DELETE /ai/:matchId` |
| Users | `GET /users`, `PUT /users/:id`, `DELETE /users/:id` |

### Contact
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/contact` | Public | Send contact form email (rate limited) |

---

## Admin Panel

Navigate to `/admin` when logged in as an admin user. The panel provides:

- **Overview** — live stats: leagues, teams, matches, streams
- **Leagues** — import from Football API in bulk or add manually; bulk-sync
- **Teams** — import from Football API filtered by league or add manually
- **Matches** — import from Football API with date/league/status filters; sync live scores; trigger AI generation
- **Streams** — view live matches and assign/edit stream URLs; trigger YouTube auto-search
- **Users** — search users, change roles, cancel subscriptions

---

## Background Jobs

Cron jobs are only active when `NODE_ENV=production`.

| Job | Schedule | Description |
|---|---|---|
| Live match sync | Every 5 min | Fetches live fixtures from Football API, upserts matches, marks stale ones as finished |
| YouTube stream refresh | Every 6 min | Searches YouTube for streams on live matches that don't have one |
| AI summary generation | Every 15 min | Generates post-match summaries for recently finished matches |
| AI preview generation | Every 30 min | Generates pre-match previews for matches within the next 2 days |

---

## Deployment

### Backend

```bash
cd backend
npm run build        # compiles TypeScript to dist/
npm start            # runs dist/index.js
```

Requires `NODE_ENV=production` and all required environment variables set. In production, ensure:

- `JWT_SECRET` is a long random string (not the development default)
- `DATABASE_URL` points to your production PostgreSQL instance
- Upstash Redis credentials are configured for caching
- `FRONTEND_ORIGIN` matches your production web domain

### Web Frontend

```bash
cd web
npm run build
npm start
```

Or deploy to Vercel — set `NEXT_PUBLIC_API_BASE` to your production backend URL in the project settings.

---
- **Stripe webhooks** are verified using the webhook signing secret
- Additional hardening to consider: WAF rules, audit logging, HTTPS enforcement, CSP headers
