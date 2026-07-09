# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A multi-service reservation/booking web app (French UI) connecting **clients**, service **providers**, and **admins**. Backend is NestJS + MongoDB; frontend is Next.js 14 (App Router). The two apps live in separate top-level folders with no root package.json — each is run and built independently.

## Commands

### Backend (`backend/`)
```bash
npm run start:dev      # dev server with watch (NestJS, default port 3001, see PORT env)
npm run build          # nest build
npm run lint           # eslint --fix on src/apps/libs/test
npm run test           # jest unit tests
npm run test:e2e       # jest e2e (test/jest-e2e.json)
npm run test:cov       # coverage
# run a single test file:
npx jest path/to/file.spec.ts
```

### Frontend (`frontend/`)
```bash
npm run dev            # next dev (default port 3000)
npm run build           # next build
npm run lint            # eslint
```

There is no shared/root install step — `npm install` must be run separately inside `backend/` and `frontend/`.

## Architecture

### Backend (NestJS, `backend/src`)

- **Module-per-domain** under `src/modules/`: `auth`, `users`, `services`, `reservations`, `reviews`, `favorites`, `search`, `notifications`, `websocket`, `admin`, `dashboard`, `advertisements`, `upload`, `email`, `ai`. Each module follows the standard Nest triad (`*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`).
- **Auth**: JWT (`@nestjs/jwt`, `passport-jwt`) plus Google OAuth (`passport-google-oauth20`). `JwtAuthGuard` (`modules/auth/guards/jwt-auth.guard.ts`) protects routes; there is no separate roles guard — controllers manually check `req.user.role !== 'admin'` (see `services.controller.ts`) and throw `ForbiddenException`. Follow this same inline-check pattern for role-gated endpoints rather than introducing a new guard.
- **Roles**: `UserRole` enum (`database/schemas/user.schema.ts`) — `client`, `provider`, `admin`. Most feature modules branch behavior on this field rather than having fully separate services per role.
- **Data layer**: Mongoose schemas live in `src/database/schemas/` (not colocated with modules) — `user`, `service`, `reservation`, `review`, `notification`, `advertisement`.
- **Config**: `src/config/configuration.ts` is the single source of env-driven config (Mongo URI, Redis, JWT secrets, bcrypt rounds, Mapbox, Dialogflow, AssemblyAI, SendGrid, SMTP). It's loaded globally via `ConfigModule.forRoot({ isGlobal: true, load: [configuration] })` — prefer adding new env vars there over reading `process.env` ad hoc in services.
- **Realtime**: Socket.io via `@nestjs/websockets`/`@nestjs/platform-socket.io`, wired in `modules/websocket`.
- **CSRF**: custom `src/csrf` module (not the `ncsrf` package, which was removed — see comments in `main.ts`).
- **Global API prefix** is `api` (set in `main.ts`), CORS is locked to `http://localhost:3000`/`3001` with credentials, and Helmet is configured with a strict CSP. Static uploads are served from `/uploads` (backed by `backend/uploads/`).
- Real (non-boilerplate) architecture decisions tend to be explained only in inline French comments in `main.ts`/`app.module.ts` — read those before changing bootstrap or CORS/CSP behavior.

### Frontend (Next.js 14 App Router, `frontend/`)

- **Routing**: `app/` holds route segments (`login`, `register`, `search`, `service`, `provider`, `client`, `admin`, `dashboard`, `profile`, `notifications`, `settings`, `verify-email`, `about`). `middleware.ts` gates all non-public routes by checking for an `accessToken`/`token` cookie and redirects to `/login?callbackUrl=...`; `publicRoutes` in that file is the allowlist to update when adding new public pages.
- **Feature logic** lives in `features/<domain>/` (hooks + a few standalone components) — e.g. `features/provider/hooks/useProviderLocation.ts`, `features/reservation/ReservationForm.tsx`. Shared presentational components live in `components/` (`components/map`, `components/charts`, `components/service`, `components/ui`).
- **API layer**: `lib/api/<domain>/` per backend module (`auth`, `services`, `reservations`, `reviews`, `notifications`, `admin`, `dash`, `chatbot`, `advertisements`, `users`). `lib/api/client.ts` (imported as `lib/api/config.ts` in some places) defines the shared Axios instance: base URL from `NEXT_PUBLIC_API_URL` (default `http://localhost:3001/api`), attaches the bearer token from `lib/helpers/storage.ts`, and force-redirects to `/login?session=expired` on 401 while clearing localStorage. Add new domain API calls as a new folder here rather than inline `axios` calls in components.
- **Auth state**: `providers/AuthProvider.tsx` + `hooks/useAuth.ts`; theme via `providers/ThemeProvider.tsx` + `hooks/useTheme.ts` (drives the `.dark` class used throughout `globals.css`).
- **Styling**: Tailwind + one large hand-written design system in `app/globals.css` (CSS variables for colors/shadows/radii/transitions under `@layer base`, reusable primitives under `@layer components`/`@layer utilities`, then many page/feature-specific BEM-ish sections — `navbar-*`, `sdp-*`/`sp-*` (service detail/cards), `prov-*` (provider dashboard pages), `admin-*`, `filterbar__*`, `cc-*` (client carte/map page), `chatbot-*`). When adding styles, prefer extending an existing section/prefix over introducing a new one, and check for an existing near-duplicate selector first — this file has previously accumulated duplicate rule blocks from copy-pasted revisions.
- **Maps**: Leaflet/react-leaflet + `leaflet-routing-machine` and Mapbox geocoder for provider/service location features; `public/tunisia.geojson` backs a custom Tunisia governorate map (`components/map`).
- **AI/chatbot**: `features/chatbot/Chatbot.tsx` + `lib/api/chatbot/*`, backed by the NestJS `ai` module (`@anthropic-ai/sdk` on the backend).

### Cross-cutting notes

- Route protection is enforced in **two places** that must stay in sync: Next `middleware.ts` (cookie presence only) and the backend `JwtAuthGuard`/manual role checks (actual authorization). Don't assume the frontend redirect is a security boundary.
- The frontend `AGENTS.md`/`CLAUDE.md` (`frontend/AGENTS.md`) warns that the installed Next.js version may differ from training-data assumptions — check `frontend/node_modules/next/dist/docs/` before relying on remembered Next.js APIs when working in `frontend/`.
- Commit messages and in-code comments are predominantly in French; match that convention for consistency in this codebase.

## Agents disponibles

Ce dépôt définit des agents spécialisés pour différentes tâches. Pour les utiliser, invoque‑les par leur nom :

- `frontend-agent` – développement Next.js / React / Tailwind  
- `backend-agent` – développement NestJS / MongoDB  
- `tester-agent` – tests et assurance qualité  
- `designer-agent` – améliorations UI / CSS  

Les définitions des agents se trouvent dans `.claude/agents/` et les compétences dans `.claude/skills/`.

- **CSS** : Tout le CSS personnalisé est centralisé dans `app/globals.css`. Les pages ne doivent pas avoir de fichiers CSS séparés. Utilise les préfixes existants ou crée un nouveau préfixe pour chaque nouvelle fonctionnalité (ex: `profile-*`, `booking-*`). Le design doit être moderne, responsive et inclure des animations fluides.