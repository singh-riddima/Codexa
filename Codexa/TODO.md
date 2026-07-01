# TODO - Codexa Targets Section Persistence & Live Readiness

## Phase 1 — Repository verification
- [x] Verified frontend `TargetsPage.tsx` is currently local-state only (no persistence).
- [x] Verified backend has no `/targets` router mounted.
- [x] Verified Prisma schema has no `Target` model.

## Phase 2 — Implement persistence layer (required for live)
- [ ] Add `Target` model to `backend/prisma/schema.prisma`.
- [ ] Create migration(s) and regenerate Prisma client.
- [ ] Add `backend/src/routes/targets.routes.ts` with CRUD endpoints.
- [ ] Mount targets routes in `backend/src/routes/index.ts`.

## Phase 3 — Wire frontend to backend
- [ ] Update `frontend/src/pages/TargetsPage.tsx` to:
  - [ ] Load targets from `GET /api/targets`.
  - [ ] Create target via `POST /api/targets`.
  - [ ] Toggle complete via `PATCH /api/targets/:id/toggle`.
  - [ ] Update progress via `PATCH /api/targets/:id`.
  - [ ] Delete via `DELETE /api/targets/:id`.
- [ ] Remove debug `console.log` from `TargetsPage.tsx`.

## Phase 4 — Build & smoke tests
- [ ] Run `npm run build:frontend`.
- [ ] Run `npm run build:backend`.
- [ ] Run local smoke test:
  - [ ] Create target
  - [ ] Refresh page
  - [ ] Verify target persists

## Phase 5 — Deployment checklist
- [ ] Set VITE_API_URL on frontend deployment.
- [ ] Set backend env: DATABASE_URL, JWT_SECRET, FRONTEND_URL.
- [ ] Run seed (if needed) and validate production auth flow.

