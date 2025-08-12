# Transparency – Job Listings with Real Response Rates

Transparency is a job application platform that tracks company response rates and helps users manage their applications.

## Features (MVP)
- User signup & login with secure password hashing
- Session management with NextAuth.js (Credentials Provider)
- Protected routes (e.g., `/applications`)
- Dynamic header: Login/Signup vs Profile/Sign out
- Prisma ORM with SQLite (local dev) – easy swap to Postgres/Supabase
- TailwindCSS for styling
- Playwright E2E tests for auth flow

---

## Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd transparency
npm install

### 2. Environment Variables
Create .env.local:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

### 3. Database
Initialize Prisma & run migration:
```bash
npx prisma migrate dev --name init

### 4. Run the Dev Server
```bash
npm run dev
Visit http://localhost:3000