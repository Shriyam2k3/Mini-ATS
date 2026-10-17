# EarlyJobs.ai Mini ATS — Applicant Tracking System

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Auth.js](https://img.shields.io/badge/NextAuth.js-v5.0-blue?style=flat&logo=auth0)](https://authjs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat&logo=mongodb)](https://www.mongodb.com/atlas)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

A modern, production-grade **Mini Applicant Tracking System (ATS)** built for the **EarlyJobs.ai Full Stack Developer Intern** assessment. The platform provides end-to-end recruitment pipeline management, secure authentication (Google OAuth, optional GitHub OAuth, and securely hashed credentials), server-side role governance (`ADMIN` and `RECRUITER`), real-time hiring metrics, visual Kanban stages, search, filtering, and candidate profile management.

---

## 🚀 Live Demo & Submission Links

- **Live Application URL**: `https://earlyjobs-mini-ats.vercel.app` *(or your deployed Vercel domain)*
- **GitHub Repository**: `https://github.com/your-username/earlyjobs-mini-ats`
- **Loom / Demo Video**: `https://www.loom.com/share/your-video-id`

---

## 📑 Table of Contents

1. [Key Features](#-key-features)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Design System](#-architecture--design-system)
4. [Authentication & Authorization](#-authentication--authorization)
5. [Database Architecture & Models](#-database-architecture--models)
6. [REST API Documentation](#-rest-api-documentation)
7. [Directory Structure](#-directory-structure)
8. [Environment Setup](#-environment-setup)
9. [OAuth Provider Configuration](#-oauth-provider-configuration)
10. [Admin Provisioning](#-admin-provisioning)
11. [Local Development](#-local-development)
12. [Testing & Verification](#-testing--verification)
13. [Deployment to Vercel & MongoDB Atlas](#-deployment-to-vercel--mongodb-atlas)
14. [2-to-3 Minute Demo Walkthrough Script](#-2-to-3-minute-demo-walkthrough-script)

---

## ✨ Key Features

### 1. Dashboard Metrics & Analytics (`/dashboard`)
- Real-time aggregations calculated directly from MongoDB data.
- Metric cards for **Total Candidates**, **Applied**, **Screening**, **Interview**, **Offer**, **Hired**, and **Rejected**.
- Interactive **Hiring Pipeline Distribution** bar chart powered by Recharts.
- Quick toggle between **Recent Applicants** and **Recently Updated Candidates**.
- Quick "Add Candidate" modal with instant metrics recalculation.
- Quick "Seed Demo Data" utility to populate realistic applicants across all hiring stages.

### 2. Candidate Management Directory (`/candidates`)
- Complete CRUD: Create, View, Edit, and Delete candidates.
- Search by name, email, or job role with debounced querying.
- Filter by hiring stage (`Applied`, `Screening`, `Interview`, `Offer`, `Hired`, `Rejected`).
- Sort by creation date or name (ascending / descending).
- Server-side pagination.
- Inline stage dropdown selector with instant MongoDB persistence.
- Safe resume link handling (`rel="noopener noreferrer" target="_blank"`).
- Delete confirmation modal to prevent accidental data loss.

### 3. Individual Candidate Profile (`/candidates/[id]`)
- Full profile view displaying candidate name, role, email, phone, and resume link.
- In-place profile editor powered by React Hook Form and Zod validation.
- Audit & Recruiter attribution metadata (who added the candidate, created timestamp, updated timestamp).
- Direct delete action with confirmation modal.

### 4. Visual Hiring Pipeline (`/pipeline`)
- Full Kanban-style board grouping candidates into 6 discrete recruitment stages.
- Each candidate card shows name, job title, email, applied date, and an inline stage selector.
- Immediate database update on stage change with optimistic UI and toast feedback.

### 5. Settings & Profile (`/settings`)
- Recruiter profile overview (name, email, avatar).
- Server-verified role badge (`RECRUITER` / `ADMIN`).
- Session diagnostics and explanation of security governance.

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server & Client Components) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS with custom ATS dark-green and light-gray palette |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | NextAuth.js / Auth.js v5 (JWT Strategy, Google OAuth, GitHub OAuth, Credentials) |
| **Password Hashing** | bcryptjs (12 rounds) |
| **Validation** | Zod (shared schemas for client forms and server Route Handlers) |
| **Forms** | React Hook Form with `@hookform/resolvers/zod` |
| **Charts** | Recharts (ResponsiveContainer, BarChart, Tooltip, Cell) |
| **Icons** | Lucide React |
| **Notifications** | Sonner (rich toast notifications) |
| **Deployment** | Vercel (Edge Middleware + Serverless Functions) |

---

## 🎨 Architecture & Design System

The UI follows the requested **SaaS Recruiter Design**:
- Clean white background (`#FFFFFF` and `#FAFAFA`).
- Dark green primary color (`#064E3B` and `#059669`).
- Light gray surfaces (`#F8FAFC`, `#F1F5F9`) with subtle borders (`#E2E8F0`).
- Typography using Google Font **Inter**.
- Rounded cards (`rounded-2xl`, `rounded-3xl`) with gentle shadows.
- Distinct stage badge color coding:
  - **Applied**: Blue (`#3B82F6`)
  - **Screening**: Amber (`#F59E0B`)
  - **Interview**: Purple (`#8B5CF6`)
  - **Offer**: Cyan (`#06B6D4`)
  - **Hired**: Emerald (`#10B981`)
  - **Rejected**: Rose (`#EF4444`)

---

## 🔐 Authentication & Authorization

### 1. Multi-Provider Authentication
- **Google OAuth**: One-click Google login using `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
- **GitHub OAuth**: Optional secondary OAuth provider using `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`.
- **Credentials Provider**: Secure email/password login with bcryptjs password verification.
- **Provider Status Detection**: If OAuth keys are not configured in `.env`, the login page gracefully displays configuration instructions rather than throwing an unhandled exception.

### 2. Session Strategy: Documented Rationale
- **NextAuth requires `strategy: "jwt"`** when the Credentials provider is enabled alongside OAuth providers. NextAuth runtime throws an error if `strategy: "database"` is selected with Credentials.
- The JWT is signed and encrypted with `AUTH_SECRET`.
- The user's `id` and `role` are embedded in the JWT token and forwarded to `session.user`.

### 3. Server-Side Role Enforcement
- Two roles: **`ADMIN`** and **`RECRUITER`**.
- New public registrations or OAuth sign-ins strictly default to **`RECRUITER`**.
- Existing user roles in MongoDB are **never overwritten** during subsequent OAuth logins.
- Client-supplied roles are **never trusted**. Reusable server-side helpers enforce security:
  - `getCurrentUser()`: Looks up session and verifies fresh record from MongoDB.
  - `requireAuth()`: Guards API routes (returns 401 for unauthenticated).
  - `requireRole(["ADMIN", "RECRUITER"])`: Guards API routes (returns 403 for unauthorized).
  - `middleware.ts`: Provides edge navigation redirection for unauthenticated visitors.

---

## 🗄 Database Architecture & Models

### 1. `User` Model
```typescript
{
  name: String (required, trim),
  email: String (required, unique, lowercase, trim, indexed),
  password: String (optional, select: false, bcrypt-hashed),
  image: String (optional),
  role: String (enum: ["ADMIN", "RECRUITER"], default: "RECRUITER"),
  createdAt: Date (timestamp),
  updatedAt: Date (timestamp)
}
```

### 2. `Candidate` Model
```typescript
{
  name: String (required, trim, indexed),
  email: String (required, unique, lowercase, trim, indexed),
  phone: String (optional, trim),
  jobRole: String (required, trim, indexed),
  stage: String (enum: ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"], default: "Applied", indexed),
  resumeUrl: String (optional, trim),
  createdBy: ObjectId (ref: "User", required, indexed),
  createdAt: Date (timestamp),
  updatedAt: Date (timestamp)
}
// Indexes: unique email index, compound text index { name, email, jobRole }
```

### 3. MongoDB Connection Caching
Implemented in `src/lib/mongodb.ts` using `global.mongooseCache` to reuse active connections across serverless function invocations and prevent connection exhaustion on Vercel.

---

## 📡 REST API Documentation

All candidate and dashboard endpoints require an active session and return standard JSON responses.

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Service health & MongoDB connection status | 200, 500 |
| `GET` | `/api/auth/providers-status` | Returns whether Google/GitHub OAuth are configured | 200 |
| `POST` | `/api/auth/register` | Register new recruiter account | 201, 400, 409, 500 |
| `GET` | `/api/candidates` | List candidates (search, stage filter, sort, pagination) | 200, 401, 500 |
| `POST` | `/api/candidates` | Create new candidate with Zod validation | 201, 400, 401, 409, 422, 500 |
| `GET` | `/api/candidates/[id]` | Fetch single candidate by ID | 200, 400, 401, 404, 500 |
| `PUT` | `/api/candidates/[id]` | Update candidate details or stage | 200, 400, 401, 404, 409, 422, 500 |
| `DELETE` | `/api/candidates/[id]` | Delete candidate record | 200, 400, 401, 404, 500 |
| `GET` | `/api/dashboard/stats` | Aggregate dashboard metrics and chart distribution | 200, 401, 500 |
| `POST` | `/api/candidates/seed` | Seed realistic demo candidates | 200, 401, 500 |
| `POST` | `/api/admin/provision` | Secure administrative bootstrap / role promotion | 200, 400, 403, 503 |

---

## 📂 Directory Structure

```
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── README.md
└── src/
    ├── auth.ts                  # NextAuth v5 configuration & callbacks
    ├── middleware.ts            # Route protection & edge redirection
    ├── constants/
    │   └── stages.ts            # Stage enums, labels, and color tokens
    ├── types/
    │   ├── candidate.ts         # Candidate & stats TypeScript types
    │   └── next-auth.d.ts       # NextAuth Session & JWT module augmentations
    ├── lib/
    │   ├── mongodb.ts           # Cached Mongoose connection
    │   ├── permissions.ts       # Server-side auth & role guards (requireAuth, requireRole)
    │   ├── utils.ts             # Styling (cn) and date formatters
    │   └── validators.ts        # Zod validation schemas
    ├── models/
    │   ├── User.ts              # Mongoose User model
    │   └── Candidate.ts         # Mongoose Candidate model with indexes
    ├── components/
    │   ├── providers/
    │   │   ├── AuthProvider.tsx # NextAuth SessionProvider
    │   │   └── ToasterProvider.tsx # Sonner Toaster
    │   ├── layout/
    │   │   ├── Sidebar.tsx      # Desktop & responsive mobile navigation
    │   │   ├── Header.tsx       # Header with demo seeder & user avatar
    │   │   └── MainLayout.tsx   # Authenticated view shell
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   ├── SocialLoginButtons.tsx
    │   │   └── UserMenu.tsx
    │   ├── dashboard/
    │   │   ├── StatCard.tsx
    │   │   ├── HiringChart.tsx
    │   │   ├── RecentCandidates.tsx
    │   │   └── QuickAddModal.tsx
    │   ├── candidates/
    │   │   ├── CandidateTable.tsx
    │   │   ├── CandidateForm.tsx
    │   │   ├── CandidateDetails.tsx
    │   │   ├── CandidateFilters.tsx
    │   │   ├── StageBadge.tsx
    │   │   └── DeleteConfirmation.tsx
    │   ├── pipeline/
    │   │   ├── PipelineColumn.tsx
    │   │   └── CandidateCard.tsx
    │   └── common/
    │       ├── LoadingState.tsx
    │       ├── EmptyState.tsx
    │       └── ErrorState.tsx
    └── app/
        ├── layout.tsx
        ├── page.tsx             # Root page (redirects to /dashboard or /login)
        ├── globals.css
        ├── login/page.tsx
        ├── register/page.tsx
        ├── unauthorized/page.tsx
        ├── auth/error/page.tsx
        ├── dashboard/page.tsx
        ├── candidates/
        │   ├── page.tsx
        │   └── [id]/page.tsx
        ├── pipeline/page.tsx
        ├── settings/page.tsx
        └── api/
            ├── auth/
            │   ├── [...nextauth]/route.ts
            │   ├── register/route.ts
            │   └── providers-status/route.ts
            ├── health/route.ts
            ├── candidates/
            │   ├── route.ts
            │   ├── seed/route.ts
            │   └── [id]/route.ts
            ├── dashboard/stats/route.ts
            └── admin/provision/route.ts
```

---

## ⚙️ Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure the following variables:

```ini
# 1. MongoDB Connection String (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/earlyjobs_mini_ats?retryWrites=true&w=majority

# 2. NextAuth Secret (Generate with: openssl rand -base64 32 or npx auth secret)
AUTH_SECRET=your_32_character_random_secret_key

# 3. Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 4. Google OAuth Credentials
AUTH_GOOGLE_ID=your_google_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your_google_client_secret

# 5. GitHub OAuth Credentials (Optional)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# 6. Admin Provisioning Key
ADMIN_PROVISION_SECRET=ats_admin_bootstrap_secret_key_12345
```

---

## 🔑 OAuth Provider Configuration

### Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project: **EarlyJobs Mini ATS**.
3. Configure the **OAuth Consent Screen** (User type: *External*, add scopes: `userinfo.email`, `userinfo.profile`).
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**.
5. Application type: **Web application**.
6. **Authorized JavaScript origins**:
   - `http://localhost:3000` (Local)
   - `https://your-app.vercel.app` (Production)
7. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (Local)
   - `https://your-app.vercel.app/api/auth/callback/google` (Production)
8. Copy the **Client ID** and **Client Secret** into your `.env.local`.

### GitHub OAuth Setup (Optional)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Homepage URL: `http://localhost:3000` (or your Vercel URL).
4. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`.
5. Save and copy `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`.

---

## 🛡 Admin Provisioning

To prevent insecure public privilege escalation, user registration defaults strictly to `RECRUITER`. To promote an existing user or create a designated bootstrap `ADMIN`, use the protected endpoint:

```bash
curl -X POST http://localhost:3000/api/admin/provision \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your_admin_secret_from_env" \
  -d '{
    "email": "admin@earlyjobs.ai",
    "action": "promote"
  }'
```

---

## 💻 Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
4. If testing credentials without OAuth configured, click **"Fill Demo Recruiter Credentials"** on the `/login` page or create a new account at `/register`.
5. Once inside, click **"Seed Demo Data"** in the top navigation header to immediately populate realistic candidates across all stages.

---

## 🧪 Testing & Verification

Run type checking:
```bash
npx tsc --noEmit
```

Build for production:
```bash
npm run build
```

### Verification Checklist:
- [x] Public users cannot access `/dashboard`, `/candidates`, `/pipeline`, or `/settings`.
- [x] Unauthenticated API requests to `/api/candidates` return `401 Unauthorized`.
- [x] Passwords are encrypted with bcrypt (12 rounds) and never exposed in API outputs.
- [x] Candidates can be created, viewed, edited, filtered, searched, and deleted.
- [x] Duplicate emails are rejected with a user-friendly `409 Conflict` message.
- [x] Stage updates persist immediately to MongoDB.
- [x] Dashboard metrics and Recharts graphs match MongoDB document counts.
- [x] External resume links open safely with `rel="noopener noreferrer"`.
- [x] Responsive layout functions seamlessly on desktop and mobile.

---

## 🌐 Deployment to Vercel & MongoDB Atlas

### 1. MongoDB Atlas Setup
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere for Vercel serverless functions).
3. Under **Database Access**, create a user with read/write permissions.
4. Copy the connection string into `MONGODB_URI`.

### 2. Vercel Deployment
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL` (`https://your-project.vercel.app`)
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_GITHUB_ID` (if used)
   - `AUTH_GITHUB_SECRET` (if used)
   - `ADMIN_PROVISION_SECRET`
5. Click **Deploy**.
6. Update your Google Cloud Console Authorized Redirect URI with your Vercel URL:
   `https://your-project.vercel.app/api/auth/callback/google`

---

## 🎬 2-to-3 Minute Demo Walkthrough Script

Use this structured script when recording your assessment demo video:

| Time | Section | Screen / Actions | Narration Guide |
|---|---|---|---|
| **0:00 – 0:30** | **Introduction & Auth** | `/login` page | *"Hello! Welcome to the EarlyJobs.ai Mini ATS. Here on the login page, you can see our support for Google OAuth, GitHub, and secure credentials authentication. Notice how unauthenticated attempts to access `/dashboard` are intercepted by middleware and server guards."* |
| **0:30 – 1:00** | **Dashboard & Metrics** | `/dashboard` | *"Upon signing in as a verified recruiter, we land on our dashboard. All metrics—Applied, Screening, Interview, Offer, Hired, Rejected—are computed via live MongoDB aggregation. We also have an interactive pipeline chart built with Recharts, along with recent activity feeds."* |
| **1:00 – 1:40** | **Candidate Directory & CRUD** | `/candidates` | *"In our candidate directory, we can search by candidate name or job title with instant debounced querying. We can filter by hiring stage and sort. Let's add a new candidate using our Zod-validated form. If we enter a duplicate email, the server immediately rejects it. Notice the inline stage dropdown—changing a stage updates MongoDB instantly."* |
| **1:40 – 2:15** | **Profile & Pipeline View** | `/candidates/[id]` & `/pipeline` | *"Clicking any candidate takes us to their profile with audit timestamps and safe external resume links. On our visual `/pipeline` Kanban board, candidates are categorized across all 6 hiring stages, and recruiters can advance candidates through the pipeline with one click."* |
| **2:15 – 2:45** | **Architecture & Wrap Up** | `/settings` & code | *"Under the hood, we use Next.js 14 App Router, NextAuth v5 with JWT session strategy, cached Mongoose connections for serverless optimization, and strict server-side role authorization. Thank you!"* |
