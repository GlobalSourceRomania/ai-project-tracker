# AI Project Tracker — Complete Architecture Guide

## 📋 Project Overview

**AI Project Tracker** is a full-stack web application for managing client projects with real-time updates, bottleneck tracking, and task checklists. Built with **Next.js 16**, it provides role-based access control (Admin, Editor, Viewer), serverless PostgreSQL backend, and responsive mobile-first design.

**Live URL:** https://globalsource-ai-tracking.vercel.app  
**GitHub:** https://github.com/GlobalSourceRomania/ai-project-tracker  
**Database:** Neon PostgreSQL (serverless)

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **Authentication:** JWT in httpOnly cookies
- **UI Components:** Custom (no external component library)

### Backend
- **Runtime:** Node.js (Vercel serverless functions)
- **API:** Next.js API Routes
- **Database Driver:** Neon (`@neondatabase/serverless`)
- **Auth:** JWT tokens with bcryptjs for password hashing
- **Environment:** PostgreSQL 15 (Neon)

### Deployment
- **Hosting:** Vercel (auto-deploy on git push)
- **Database:** Neon PostgreSQL serverless
- **CI/CD:** GitHub Actions (via Vercel)

---

## 🗄 Database Schema

### Neon PostgreSQL Setup
- **Connection:** `DATABASE_URL` environment variable (set in Vercel Settings)
- **Type:** Serverless PostgreSQL 15
- **Region:** Auto-selected by Neon

### Tables

#### `users`
```sql
id SERIAL PRIMARY KEY
email TEXT NOT NULL UNIQUE
password_hash TEXT NOT NULL (bcryptjs)
display_name TEXT
role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer'
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```
**Roles:**
- **Admin:** Full CRUD on projects + user management
- **Editor:** CRUD projects, add/edit updates & tasks
- **Viewer:** Read-only, can toggle tasks (see all projects)

#### `projects`
```sql
id SERIAL PRIMARY KEY
title TEXT NOT NULL
pipedrive_code TEXT UNIQUE (e.g., #260422z1)
owner_id INTEGER FK → users(id)
status TEXT CHECK (status IN ('planning', 'in_progress', 'waiting', 'completed', 'bottleneck'))
description TEXT (project overview)
bottleneck TEXT (current blocker — auto-sets status when filled)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### `project_updates`
```sql
id SERIAL PRIMARY KEY
project_id INTEGER FK → projects(id)
author_id INTEGER FK → users(id)
what_done TEXT (completed activities)
what_waiting TEXT (awaiting client input)
next_steps TEXT (upcoming actions)
created_at TIMESTAMPTZ
```
**Timeline entries** — immutable; edit/delete allowed for editors/admins.

#### `project_tasks`
```sql
id SERIAL PRIMARY KEY
project_id INTEGER FK → projects(id)
title TEXT NOT NULL
is_done BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ
```
**Checklist items** — toggle `is_done`, add/delete allowed for editors/admins.

---

## 🔐 Authentication Flow

### Login
1. User submits email + password on `/login` page
2. Frontend sends `POST /api/auth` with `{ action: 'login', email, password }`
3. Backend:
   - Fetches user by email
   - Compares password with bcryptjs
   - Generates JWT token (7-day expiry)
   - Sets httpOnly Secure cookie `token=<JWT>`
4. Frontend redirects to `/projects` on success

### Session Management
- **JWT Payload:** `{ userId, email, role }`
- **Storage:** httpOnly cookie (secure, no XSS access)
- **Verification:** Every API request reads cookie, decodes JWT
- **Logout:** `POST /api/auth` with `{ action: 'logout' }` clears cookie

### Role-Based Access Control
- **Viewer:** Cannot create/edit/delete projects or tasks
- **Editor:** Can CRUD projects, add/edit updates & tasks
- **Admin:** Full access + user management (`/admin/users`)

---

## 📱 Frontend Architecture

### Key Pages

#### `/login`
- Email + password form
- Auto-redirect to `/projects` if already logged in
- Error messages on failed auth

#### `/projects` (Dashboard)
- **Grid Layout:** 1 col (mobile), 2 cols (tablet), 3 cols (desktop)
- **Cards:** Show title, pipedrive code, description snippet, bottleneck indicator, status badge, owner
- **Click Card:** Opens modal with full details
- **Modal Sections:**
  - Owner, Created date, Status (with Change button)
  - Description (editable with Edit button)
  - Bottleneck (orange box, editable, auto-sets status to 'Bottleneck')
  - Tasks (checklist with progress bar, add/toggle/delete)
  - Timeline (updates with what_done/what_waiting/next_steps)
  - Delete button (with confirmation)

#### `/admin/users`
- **Table:** Email, Name, Role (dropdown), Created date
- **Actions:** Edit role (inline select + Save), Delete (with confirm)
- **Create User:** Form with email, name, password, role dropdown
- **Access:** Admin-only (redirects if not admin)

### Color Scheme
- **Background:** `#080D1A` (dark navy)
- **Primary Accent:** `#00B4EF` (cyan blue)
- **Success/Complete:** `#8DC63F` (green)
- **Warning/Bottleneck:** Orange (`text-orange-300`)
- **Text:** White with opacity layers for hierarchy
- **Borders:** `white/[0.07]` to `white/[0.1]` (subtle dividers)
- **Inputs:** Dark backgrounds `#111827` with transparent overlays

### Mobile Optimizations
- Viewport: `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=false`
- Input font-size: 16px (prevents iOS zoom on focus)
- Responsive grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Modal max-height with scroll: `max-h-[90vh] overflow-y-auto`

---

## 🔌 Backend API Routes

All routes use **Neon SQL with tagged template literals** (no dynamic strings).

### Authentication
- `POST /api/auth` — Login/Logout
- `GET /api/me` — Current user profile

### Projects (CRUD)
- `GET /api/projects` — List all projects
- `POST /api/projects` — Create project
- `PUT /api/projects/[id]` — Update project (auto-sets status when bottleneck saved)
- `DELETE /api/projects/[id]` — Delete project (cascades to updates & tasks)

### Timeline Updates
- `GET /api/projects/[id]/updates` — Fetch project timeline
- `POST /api/projects/[id]/updates` — Add update
- `PUT /api/projects/[id]/updates` — Edit update
- `DELETE /api/projects/[id]/updates` — Delete update

### Tasks (Checklist)
- `GET /api/projects/[id]/tasks` — Fetch all tasks for project
- `POST /api/projects/[id]/tasks` — Add task
- `PUT /api/projects/[id]/tasks` — Toggle task completion
- `DELETE /api/projects/[id]/tasks` — Delete task

### User Management (Admin-only)
- `GET /api/users` — List all users
- `POST /api/users` — Create user
- `PUT /api/users/[id]` — Update user
- `DELETE /api/users/[id]` — Delete user

### Setup
- `POST /api/setup` — Initialize database (creates tables + migrations)

---

## 🚀 Deployment & Environment Setup

### Local Development
```bash
npm install
# Create .env.local with DATABASE_URL and JWT_SECRET
npm run dev
# Open http://localhost:3000
```

### Vercel Deployment
1. Connect GitHub repo to Vercel
2. Set `DATABASE_URL` and `JWT_SECRET` in Vercel Settings → Environment Variables
3. Push to main → auto-deploy in ~2-3 minutes
4. Run `POST /api/setup` once to initialize database

### Neon PostgreSQL
1. Create account at neon.tech
2. Create PostgreSQL 15 project
3. Copy connection string to `DATABASE_URL`

---

## 🔄 Key Features

✅ **Projects:** Create, edit, delete + 5 statuses (Planning, In Progress, Waiting, Completed, Bottleneck)  
✅ **Description:** Text field per project (editable inline)  
✅ **Bottleneck:** Special field that auto-sets project status to 'Bottleneck' when filled  
✅ **Timeline:** What done / what waiting / next steps per project  
✅ **Tasks:** Checklist with toggles + progress bar showing completion percentage  
✅ **Users:** 3 roles (Admin, Editor, Viewer) with permission-based UI + user management panel  
✅ **Responsive:** Mobile, tablet, desktop layouts  
✅ **Dark Theme:** #080D1A background with blue/green accents  
✅ **Notifications:** Toast messages for all actions  
✅ **Security:** JWT authentication, bcryptjs password hashing, parameterized SQL queries  

---

## 🧪 Testing

### Default Credentials (After Setup)
```
Email: admin@example.com
Password: password
```
⚠️ Change immediately in production!

### API Debugging
```bash
curl https://globalsource-ai-tracking.vercel.app/api/me
curl -X POST https://globalsource-ai-tracking.vercel.app/api/setup
```

---

## 📝 Environment Variables

```env
DATABASE_URL=postgresql://...      # Neon connection string
JWT_SECRET=your-secret-here        # JWT signing key (min 32 chars)
NODE_ENV=production                # Auto-set by Vercel
```

---

## 📦 Dependencies

- `next` 16.x — Framework
- `react` 19.x — UI library
- `@neondatabase/serverless` — Database driver
- `jsonwebtoken` — JWT generation/verification
- `bcryptjs` — Password hashing
- `tailwindcss` 4.x — Styling
- `typescript` — Type safety

---

## 🔗 File Connections

```
Frontend                          Backend API                      Database
─────────────────────────────────────────────────────────────────────────
/login                      POST /api/auth                  → users table
  ↓                              ↓
  ├→ email+password → verifyPassword() → JWT token
  └→ httpOnly cookie ← setAuthCookie()

/projects                   GET /api/projects               → projects table
  ├→ useEffect fetch          joinwith users.id → owner_name
  ├→ click card → openModal
  │   ├─ GET /api/projects/[id]/updates         → project_updates
  │   ├─ GET /api/projects/[id]/tasks           → project_tasks
  │   └─ Modal shows all 3 + edit forms
  │
  ├→ edit status → PUT /api/projects/[id]        → status column
  ├→ edit description → PUT /api/projects/[id]   → description column
  ├→ edit bottleneck → PUT /api/projects/[id]    → bottleneck + auto status='bottleneck'
  ├→ add task → POST /api/projects/[id]/tasks    → create row
  ├→ toggle task → PUT /api/projects/[id]/tasks  → update is_done
  ├→ add update → POST /api/projects/[id]/updates → create row
  └→ delete → DELETE /api/projects/[id]          → cascades to updates & tasks

/admin/users                GET /api/users                  → users table
  ├→ edit role → PUT /api/users/[id]
  ├→ delete → DELETE /api/users/[id]
  └→ create → POST /api/users
```

---

## 📞 Quick Reference

| Action | Who Can | Where | Result |
|--------|---------|-------|--------|
| View projects | All (authenticated) | Dashboard grid | Read-only for viewers |
| Create project | Editor, Admin | + New button | Adds to grid |
| Edit project | Editor, Admin | Modal edit buttons | Updates DB + UI |
| Delete project | Editor, Admin | Delete button + confirm | Removes project + all updates/tasks |
| Add update | Editor, Admin | Timeline section | Creates entry with timestamp |
| Add task | Editor, Admin | Tasks section | Creates checklist item |
| Toggle task | Editor, Admin | Click checkbox | Updates is_done |
| Create user | Admin | /admin/users page | Creates new account |
| Edit user | Admin | Role dropdown + Save | Updates user role |
| Delete user | Admin | Delete button + confirm | Removes user account |
| Logout | All | Header button | Clears JWT cookie |

---

**Last Updated:** April 23, 2026  
**Version:** 1.0  
**Status:** ✅ Live & Production-Ready  
**Maintainers:** GlobalSource Romania Team  
**Ready to:** Start new conversations with full context
