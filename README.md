# EarlyJobs.ai Mini ATS — Advanced Recruitment Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Auth.js](https://img.shields.io/badge/NextAuth.js-v5.0-blue?style=flat&logo=auth0)](https://authjs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat&logo=mongodb)](https://www.mongodb.com/atlas)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

A comprehensive, production-ready **Mini Applicant Tracking System (ATS)** built for the **EarlyJobs.ai Full Stack Developer Intern** assessment. The platform features end-to-end recruitment lifecycle management, drag-and-drop Kanban pipeline progression, Job Requisitions, Interview Scheduling, Candidate Notes & Activity Timeline, CSV Export & Import, and advanced telemetry analytics.

---

## 🚀 Live Demo & Repository Links

- **Live Application URL**: [https://mini-ats-eight-mu.vercel.app/](https://mini-ats-eight-mu.vercel.app/)
- **GitHub Repository**: [https://github.com/Shriyam2k3/Mini-ATS](https://github.com/Shriyam2k3/Mini-ATS)
- **Demo Walkthrough Video**: `https://www.loom.com/share/your-video-id`

---

## 📑 Table of Contents

1. [Key Features & Upgrades](#-key-features--upgrades)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Design System](#-architecture--design-system)
4. [Authentication & Role Governance](#-authentication--role-governance)
5. [Database Architecture & Mongoose Models](#-database-architecture--mongoose-models)
6. [Complete REST API Documentation](#-complete-rest-api-documentation)
7. [Directory Structure](#-directory-structure)
8. [Environment Setup](#-environment-setup)
9. [Local Development & Verification](#-local-development--verification)
10. [Deployment to Vercel & MongoDB Atlas](#-deployment-to-vercel--mongodb-atlas)
11. [Updated Demo Walkthrough Script](#-updated-demo-walkthrough-script)

---

## ✨ Key Features & Upgrades

### 1. Advanced Recruitment Dashboard (`/dashboard`)
- **Real-Time KPIs**: Total Candidates, Total Open Jobs, Upcoming Interviews, and Hiring Conversion Rate.
- **Stage Distribution**: Live count across `Applied`, `Screening`, `Interview`, `Offer`, `Hired`, and `Rejected`.
- **Hiring Funnel & Conversion Rates**: Progressive retention visualization showing conversion percentages at each funnel step.
- **Application Velocity Trend**: 14-day Recharts area chart showing daily application intake.
- **Date-Range Filtering**: Switch telemetry between **All Time**, **Last 30 Days**, and **Last 7 Days**.
- **Upcoming Interviews Widget**: Quick glance at candidate meetings with links to candidate profiles.
- **Recent Candidates & Activity Feeds**: Split view for latest applicants and recent profile modifications.

### 2. Drag-and-Drop Hiring Pipeline (`/pipeline`)
- Full **Kanban Board** with columns for each hiring stage.
- **HTML5 Drag-and-Drop**: Drag candidate cards directly into target stages with animated drop target feedback.
- **Optimistic UI with Rollback**: Stage updates immediately in the UI; if the server request fails, the card reverts with toast notification.
- **Accessible Fallback**: Every card contains a keyboard-accessible stage selector for full compliance.
- **Audit Logging**: Every stage transition records an activity event with previous and new stage values.

### 3. Job Management Requisitions (`/jobs`, `/jobs/create`, `/jobs/[id]`)
- Create and manage job openings with Department, Location, Employment Type, Openings, and Skills.
- Filter by status (`Open`, `Draft`, `On Hold`, `Closed`) and Department.
- Associate candidates directly with specific job openings.
- Displays applicant counts on each job card.
- **Closed Job Protection**: Prevents new applications from associating with closed positions while safely preserving existing records.
- Dedicated Job Details page displaying all candidates mapped to that specific job.

### 4. Interview Scheduling Module (`/interviews`)
- Schedule interviews specifying Date & Time, Duration, Interview Type (`Video`, `Phone`, `In Person`), and Interviewer Name.
- Candidate picker with validation preventing invalid scheduling.
- Meeting links and preparation notes.
- Separate views for **Upcoming Interviews** and **Past / Completed Interviews**.
- **Outcome & Feedback Modal**: Record interviewer ratings (1 to 5 stars), written evaluation feedback, and update status (`Scheduled`, `Completed`, `Cancelled`, `Rescheduled`).

### 5. Candidate Notes & Activity Timeline
- Integrated activity stream on candidate profiles tracking:
  - `CREATED` (profile creation)
  - `STAGE_CHANGED` (progression from stage A to stage B)
  - `INTERVIEW_SCHEDULED` (interview details and interviewer)
  - `INTERVIEW_STATUS` (outcomes and ratings)
  - `NOTE_ADDED` (recruiter observations)
  - `HIRED` & `REJECTED` milestones
- In-line note posting form with instant timeline updates.

### 6. Advanced Candidate Profiles (`/candidates/[id]`)
- Tabbed profile interface:
  - **Overview**: Contact info, experience, current company, designation, salary, notice period, skills pills.
  - **Documents**: Safe external links to Resume, Portfolio, and LinkedIn.
  - **Activity Timeline & Notes**: Chronological audit trail.
  - **Interviews**: Candidate's scheduled and completed assessments.
  - **Edit Profile**: In-place editing powered by React Hook Form & Zod.

### 7. Advanced Search & CSV Tools (`/candidates`)
- Multi-dimensional search across Name, Email, Job Title, Current Company, and Skills.
- Filter by Stage, Job Requisition, Skill, and Application Date Range.
- Sort by Creation Date, Name, and Years of Experience.
- **Export to CSV**: Exports currently filtered candidates with CSV formula-injection protection (`=`, `+`, `-`, `@` sanitization).
- **Import from CSV**: Downloadable sample template, row-by-row validation, duplicate email detection, preview mode, and explicit user confirmation.

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components & Client Components) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS (Custom Dark Green `#064E3B`, Light Gray Surfaces `#F8FAFC`) |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | NextAuth.js / Auth.js v5 (JWT Strategy, Google OAuth, GitHub OAuth, Credentials) |
| **Password Hashing** | bcryptjs (12 salt rounds) |
| **Validation** | Zod (Shared schemas for forms and route handlers) |
| **Forms** | React Hook Form with `@hookform/resolvers/zod` |
| **Charts** | Recharts (ResponsiveContainer, BarChart, AreaChart, Tooltips) |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Deployment** | Vercel |

---

## 🔐 Authentication & Role Governance

- **Session Strategy**: Configured with JWT strategy (`strategy: "jwt"`), required by NextAuth when combining Credentials with OAuth.
- **Roles**: `ADMIN` and `RECRUITER`. Public sign-ups default strictly to `RECRUITER`.
- **Edge Navigation**: Next.js `middleware.ts` intercepts unauthenticated visits to `/dashboard`, `/candidates`, `/pipeline`, `/jobs`, `/interviews`, and `/settings`.
- **Server Guards**: All API route handlers verify the session using `requireAuth()` and `requireRole()`.
- **Admin Provisioning**: Documented endpoint `/api/admin/provision` guarded by `ADMIN_PROVISION_SECRET`.

---

## 🗄 Database Architecture & Mongoose Models

1. **`User`**: `name`, `email` (unique, lowercase), `password` (bcrypt-hashed, hidden), `image`, `role` (`ADMIN` | `RECRUITER`), timestamps.
2. **`Candidate`**: `name`, `email` (unique), `phone`, `jobRole`, `stage`, `jobId` (ref `Job`), `skills`, `yearsOfExperience`, `currentCompany`, `currentDesignation`, `resumeUrl`, `portfolioUrl`, `linkedInUrl`, `notes`, `source`, `noticePeriod`, `expectedSalary`, `createdBy` (ref `User`), timestamps.
3. **`Job`**: `title`, `department`, `location`, `employmentType`, `description`, `requiredSkills`, `experienceRequirements`, `openings`, `status` (`Draft` | `Open` | `On Hold` | `Closed`), `createdBy` (ref `User`), timestamps.
4. **`Interview`**: `candidateId` (ref `Candidate`), `jobId` (ref `Job`), `scheduledAt`, `durationMinutes`, `interviewType` (`Phone` | `Video` | `In Person`), `interviewerName`, `meetingLink`, `status` (`Scheduled` | `Completed` | `Cancelled` | `Rescheduled`), `notes`, `feedback`, `rating` (1-5), `createdBy` (ref `User`), timestamps.
5. **`CandidateActivity`**: `candidateId` (ref `Candidate`), `type` (`CREATED`, `STAGE_CHANGED`, `INTERVIEW_SCHEDULED`, etc.), `title`, `description`, `previousValue`, `newValue`, `actorId` (ref `User`), `actorName`, `createdAt`.

---

## 📡 Complete REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & MongoDB Atlas status |
| `GET` | `/api/auth/providers-status` | OAuth availability detection |
| `POST` | `/api/auth/register` | Recruiter registration |
| `GET` | `/api/candidates` | List candidates (search, stage, job, skill, date range, pagination) |
| `POST` | `/api/candidates` | Create candidate profile & record activity |
| `GET` | `/api/candidates/[id]` | Fetch single candidate profile |
| `PUT` | `/api/candidates/[id]` | Update candidate profile or stage |
| `DELETE` | `/api/candidates/[id]` | Delete candidate record |
| `GET` | `/api/candidates/[id]/activity` | Fetch candidate activity timeline |
| `POST` | `/api/candidates/[id]/notes` | Add recruiter note & record timeline event |
| `GET` | `/api/candidates/export` | Export filtered candidates to CSV (formula safe) |
| `POST` | `/api/candidates/import` | Bulk CSV import with validation & duplicate detection |
| `GET` | `/api/jobs` | List job openings with applicant counts |
| `POST` | `/api/jobs` | Create new job requisition |
| `GET` | `/api/jobs/[id]` | Fetch job details and applicant statistics |
| `PUT` | `/api/jobs/[id]` | Update job details or status |
| `DELETE` | `/api/jobs/[id]` | Delete job and disassociate candidates |
| `GET` | `/api/interviews` | List upcoming or past interviews |
| `POST` | `/api/interviews` | Schedule new interview |
| `PUT` | `/api/interviews/[id]` | Update interview status, rating, and feedback |
| `DELETE` | `/api/interviews/[id]` | Remove interview record |
| `GET` | `/api/dashboard/stats` | Aggregate dashboard KPIs, funnel, and trends |
| `POST` | `/api/candidates/seed` | Seed realistic demo candidates, jobs, and interviews |
| `POST` | `/api/admin/provision` | Secure administrative bootstrap / promotion |

---

## ⚙️ Environment Setup

Copy `.env.example` to `.env.local`:

```ini
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/earlyjobs_mini_ats?retryWrites=true&w=majority

# NextAuth.js / Auth.js Secret
AUTH_SECRET=your_32_character_random_secret_key

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth Credentials
AUTH_GOOGLE_ID=your_google_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your_google_client_secret

# GitHub OAuth Credentials (Optional)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Admin Provisioning Secret Key
ADMIN_PROVISION_SECRET=earlyjobs_ats_admin_bootstrap_secret_2026
```

---

## 💻 Local Development & Verification

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Type-check and production build:
```bash
npx tsc --noEmit
npm run build
```

4. **Default Accounts**:
   - **Admin**: `admin@earlyjobs.ai` / `AdminPassword123!`
   - **Recruiter**: `recruiter@earlyjobs.ai` / `Recruiter123!` (or click "Fill Demo Recruiter Credentials" on `/login`).

---

## 🌐 Deployment to Vercel & MongoDB Atlas

1. **MongoDB Atlas**:
   - In **Network Access**, ensure IP `0.0.0.0/0` is allowed for Vercel functions.
   - Verify database user credentials.
2. **Vercel**:
   - Push your code to GitHub.
   - Import the repository on [Vercel](https://vercel.com/).
   - Add environment variables (`MONGODB_URI`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_PROVISION_SECRET`).
   - Update Google Cloud Console Authorized Redirect URI with your Vercel domain:
     `https://your-project.vercel.app/api/auth/callback/google`.

---

## 🎬 Updated Demo Walkthrough Script

| Time | Section | Screen / Actions | Narration Guide |
|---|---|---|---|
| **0:00 – 0:30** | **Authentication & Dashboard** | `/login` to `/dashboard` | *"Welcome to the upgraded EarlyJobs.ai Mini ATS. We sign in using our credentials or Google OAuth. On the dashboard, we now have real-time KPIs for Total Candidates, Open Jobs, Upcoming Interviews, and Hiring Conversion Rate. We can toggle our date filter between All Time, 30 Days, and 7 Days. Notice the interactive Hiring Funnel and 14-day Application Velocity trend charts."* |
| **0:30 – 1:10** | **Job Management Requisitions** | `/jobs` & `/jobs/[id]` | *"Next, let's explore our new Job Management module. Here recruiters can create job openings across Engineering, Design, Product, and Sales with experience and skill requirements. Each job displays live applicant counts. When we view a job, we can see all candidates specifically mapped to that opening."* |
| **1:10 – 1:50** | **Candidate Profiles & Notes** | `/candidates/[id]` | *"In our candidate directory, we now have advanced filtering by job opening, skills, and application date range. Let's open a candidate profile: notice the new tabbed layout with candidate skills, experience, portfolio links, and our activity audit stream. Let's add a recruiter note—it posts instantly and is permanently recorded in the candidate's activity timeline."* |
| **1:50 – 2:25** | **Drag-and-Drop Kanban Pipeline** | `/pipeline` | *"Now let's look at the visual Kanban Pipeline. Recruiters can drag and drop candidate cards across columns—from Screening to Interview, and from Interview to Offer. Changes persist immediately to MongoDB with optimistic UI updates and activity logging."* |
| **2:25 – 2:50** | **Interview Scheduling & CSV Tools** | `/interviews` & `/candidates` | *"In our Interview module, recruiters can schedule technical rounds, provide Google Meet links, and record interviewer ratings and written feedback. Finally, on our candidate directory, recruiters can export filtered lists to safe CSV files or bulk-import candidates with pre-validation preview. Thank you!"* |
