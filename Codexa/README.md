# Codexa

Codexa is a modern AI-powered placement preparation tracker for students preparing for technical interviews. It combines a cinematic SaaS-style frontend with a TypeScript Express backend, Prisma schema, PostgreSQL support, and a production-ready deployment layout.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, React Router, Axios, TanStack Query
- UI system: ShadCN-style primitives, glassmorphism cards, gradient actions, and dark cyber styling
- Backend: Node.js, Express, TypeScript, JWT, Bcrypt, Zod
- Database: PostgreSQL with Prisma ORM
- Deployment: Vercel for frontend, Render or Railway for backend, Supabase or Neon for Postgres

## Project Structure

- `frontend/` - dashboard UI, landing page, auth screens, trackers, analytics, and settings
- `backend/` - REST API, auth, progress tracking, analytics, profile, and goals
- `prisma/` - Prisma schema and seed data

## Getting Started

1. Copy `.env.example` to `.env` and configure your database and JWT values.
2. Install dependencies in the root and workspace packages.
3. Run Prisma generate and migrations.
4. Start the frontend and backend in separate terminals.

### Quick start (local)

Install dependencies for frontend and backend:

```bash
# from repo root
npm install
cd frontend && npm install
cd ../backend && npm install
```

Run the backend (default port 4000):

```bash
cd backend
# copy .env.example to .env and set DATABASE_URL, JWT_SECRET
npm run dev
```

Run the frontend:

```bash
cd frontend
# copy .env.example to .env if you need to set VITE_API_URL
npm run dev
```

## Scripts

- Root: `npm run dev:frontend`, `npm run dev:backend`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`
- Backend: `npm run dev`, `npm run build`, `npm run start`, `npm run seed`

## Environment Variables

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `VITE_API_URL`

## Prisma Models

Codexa includes schema coverage for:

- Users
- DSA topics
- Coding problems
- Subject progress
- Aptitude performance
- Goals
- Analytics snapshots
- Mock interviews
- Resume analysis

## API Surface

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `CRUD /api/tracker/*`
- `GET /api/analytics`
- `POST /api/analytics/snapshot`
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `CRUD /api/goals`

## Design Notes

- Dark black and purple gradient atmosphere
- Neon glow accents and glassmorphism panels
- Dashboard-focused layout with sidebar navigation
- Motion-rich cards and animated chart surfaces
- Future AI sections reserved for recommendations, mock interviews, and resume analysis

## Deployment

- Frontend: connect the `frontend/` folder to Vercel
- Backend: connect the `backend/` folder to Render or Railway
- Database: use Supabase or Neon PostgreSQL and copy the connection string into `DATABASE_URL`

If you'd like, I can add a `vercel` project config or a `render` service template and CI workflow.

## Seed User

- Email: `demo@codexa.dev`
- Password: `password123`

This workspace is structured to be extended into a full portfolio-grade product without reworking the core architecture.