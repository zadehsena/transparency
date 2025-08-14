# Transparency – Job Listings with Real Response Rates

Transparency is a job application platform that tracks company response rates and helps users manage their applications.

## Features (MVP)
### Auth & User Management
- Secure signup & login with hashed passwords
- Session handling via NextAuth.js (Credentials Provider)
- Protected routes (e.g. /applications)
- Dynamic header based on auth state (Login/Signup vs Profile/Sign out)

### Application Tracking
- View company-level response rates
- See median response times & total applications

### Tech Stack
- Next.js 13+ (App Router)
- Prisma ORM with SQLite for local dev (easily switchable to Postgres/Supabase)
- Tailwind CSS for rapid UI development
- Playwright E2E tests for authentication flow
- TypeScript for type safety

---

## Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd transparency
npm install
```

### 2. Environment Variables
Create .env.local:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

### 3. Database
Initialize Prisma & run migration:
```bash
npx prisma migrate dev --name init
```

(Optional) Open Prisma Studio to explore your database:
```bash
npx prisma studio
```

### 4. Run the Dev Server
```bash
npm run dev
```
Your app will be available at http://localhost:3000

###5 Testing - Run Playwright E2E tests:
```bash
npx playwright test
```
