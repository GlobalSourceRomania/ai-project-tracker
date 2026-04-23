# Handoff: AI Project Tracker (Global Source)

## Overview
Internal web + mobile app for **Global Source** to track the status of AI-vision / automation projects delivered to clients (Schaeffler etc.). Engineers log projects, break them into small actionable tasks/steps, mark bottlenecks, and record chronological updates. Admins manage user accounts. Role-based permissions gate destructive actions.

## About the Design Files
The files in this bundle are **design references created in HTML + React (Babel-transpiled in the browser)**. They are *prototypes* showing the intended look, information architecture, and behavior — **not production code to copy directly**.

Your task is to **recreate these designs in the target codebase's existing environment**, using its established patterns, component libraries, routing, and state management. If no environment exists yet, pick the most appropriate framework (**Next.js 14 App Router + TypeScript + Tailwind** is the recommended default — see "Recommended Stack" below) and implement the designs there.

## Fidelity
**High-fidelity.** Final colors, typography scale, spacing, elevation, motion feel, and component treatment are settled. Pixel-perfect recreation is expected. Copy (including Romanian text mixed with English UI labels) is representative — keep the bilingual pattern but final copy can be tuned with the team.

---

## Recommended Stack
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with CSS variables for tokens (see "Design Tokens" below)
- **shadcn/ui** for Dialog, DropdownMenu, Tooltip, Checkbox, Input primitives
- **Lucide-react** for icons (the prototype uses inline SVGs that map 1:1 to Lucide names — see "Icons")
- **Prisma + Postgres** for persistence (schema suggestion below)
- **NextAuth.js** with credentials / Google Workspace (restrict to `@globalsource.ro` domain)
- **Framer Motion** for the card hover lift and modal transitions (optional — CSS is sufficient)
- **@dnd-kit** for kanban drag-and-drop (not in the prototype but expected in v1)

---

## Design Tokens

### Colors (CSS variables — copy into `globals.css` / Tailwind config)
```css
--bg-0: #07090d;          /* App background (deepest) */
--bg-1: #0b0f15;          /* Sidebar / elevated bg */
--surface: #111722;       /* Cards, modals */
--surface-2: #161e2d;     /* Hover/nested surface */
--surface-3: #1b2436;
--line: #1f2a3d;          /* Default borders */
--line-2: #2a364d;        /* Stronger borders, inputs */
--ink: #e7ecf5;           /* Primary text */
--ink-2: #aab3c5;         /* Secondary text */
--ink-3: #6b768b;         /* Tertiary / meta / placeholders */

/* Brand — Global Source */
--gs-green: #8dd13a;
--gs-blue:  #2ba8d9;
--grad: linear-gradient(135deg, #8dd13a 0%, #2ba8d9 100%);
--grad-soft: linear-gradient(135deg, rgba(141,209,58,0.18), rgba(43,168,217,0.18));

/* Status */
--st-planning:   #aab3c5;   /* neutral grey */
--st-progress:   #8dd13a;   /* green */
--st-waiting:    #e8a73a;   /* amber */
--st-bottleneck: #e8863a;   /* orange */
--st-done:       #2ba8d9;   /* blue */

/* Roles */
--role-admin:  #e64b4b;
--role-editor: #2ba8d9;
--role-viewer: #aab3c5;
```

### Typography
- **Sans**: `Inter` 400 / 500 / 600 / 700 / 800 — body + UI
- **Display**: `Space Grotesk` 500 / 600 / 700 — headings, hero numbers (letter-spacing: -0.015em to -0.025em)
- **Mono**: `JetBrains Mono` 400 / 500 / 600 — IDs, timestamps, metadata labels, kbd

Scale:
| Use | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Hero (login) | Space Grotesk | 56px | 700 | line-height 1.05, -0.025em |
| Modal title | Space Grotesk | 28px | 700 | -0.015em |
| H1 (topbar) | Space Grotesk | 22px | 700 | -0.01em |
| Card title | Inter | 15px | 600 | -0.005em |
| Body | Inter | 13–14px | 400 | line-height 1.5–1.65 |
| Meta/labels | JetBrains Mono | 10–11px | 500–600 | uppercase, letter-spacing 0.1–0.2em |
| Stat numbers | Space Grotesk | 28–30px | 700 | |

### Spacing
Tailwind's default 4px scale. Component padding: cards `16px`, modal head `24–28px`, topbar `18px 28px`.

### Radii
- Small (chip, kbd): **4–6px**
- Inputs, buttons: **8px**
- Cards: **14px**
- Modals: **16px**
- Avatars: **50%** (circle) or **10px** (table squircle)

### Shadows & Elevation
```css
/* Default card */
box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.5);

/* Bold card (kanban / project cards) — A-style hard offset */
box-shadow: 6px 6px 0 rgba(141,209,58,0.08), 0 1px 0 rgba(255,255,255,0.04) inset;

/* Bold card :hover — translate(-2,-2), shift shadow + border to blue */
box-shadow: 8px 8px 0 rgba(43,168,217,0.15), 0 1px 0 rgba(255,255,255,0.04) inset;
transform: translate(-2px, -2px);
border-color: var(--gs-blue);

/* Modal */
box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(141,209,58,0.08);

/* Primary button */
box-shadow: 0 4px 14px rgba(43,168,217,0.25);
box-shadow: 0 6px 20px rgba(43,168,217,0.4); /* hover */
```

### Ambient Background (web only)
Fixed full-viewport layer behind all content:
- Base: `var(--bg-0)`
- Two/three `border-radius: 50%` blobs, `filter: blur(90px)`, `mix-blend-mode: screen`, opacity 0.15–0.35
  - Blob 1: 600px green (top-left), drifts ~24s
  - Blob 2: 700px blue (bottom-right), drifts ~30s
  - Blob 3: 400px blue faint (center), drifts ~35s
- Subtle dotted/line grid overlay (48×48px, `rgba(255,255,255,0.025)` 1px lines) masked with a radial-gradient vignette

Keep this **always-on, low-energy, infinite CSS animation** — it's the visual signature. See `AI Project Tracker.html` `.ambient` block for the exact keyframes.

---

## Screens / Views

### 1. Login (web + mobile)
- **Purpose**: Sign in with `@globalsource.ro` email.
- **Layout (web)**: Two-column 50/50 over the ambient background.
  - Left column: pill-badge `AI_TRACKER · V1.2` (green dot + mono), hero headline "Ship AI," / "**unblock the line.**" (second line gradient-filled), sub-copy, and a stat row (14 active / 8 shipped / 2 blocked) in Space Grotesk 30px with mono labels.
  - Right column: 60% opacity backdrop-blur panel with the logo, "Sign in" title, email + password inputs (labels in mono uppercase), primary gradient button full-width, "Need access? Contact your admin." footnote.
- **Layout (mobile)**: Single column, 24px padding, hero headline 36px, same form beneath.
- **Validation**: email must end `@globalsource.ro`; show inline error under the field.
- **On success**: route to `/projects` (default view).

### 2. Projects list (web)
Main working view. Three switchable modes.
- **Topbar** (sticky, backdrop-blur): Page title "Projects" + breadcrumb `workspace / projects`, centered search input (max-w 440px, `⌘K` kbd), bell icon button, primary **New project** button (gradient).
- **Stat row**: 4 cards — Active, Bottleneck, Waiting, Completion. The "Completion %" stat uses a **gradient text fill**; the others use their status colors. Each has a 2px gradient underline (spark line) at the bottom.
- **Filter row**: pill chips (All / In progress / Bottleneck / Waiting / Planning) with counts. Selected chip uses the gradient fill with black text. Right side: **view toggle** (Kanban / Cards / Table) with icon + label; selected uses `--grad-soft` background.
- **Kanban view** (default): 5 columns — one per status. Column header is a pill-ish card with a colored top border (matches status), dot, title, and count pill. Below the header, stack of project cards and a dashed "+ add card" affordance.
- **Cards view**: responsive grid `repeat(auto-fill, minmax(320px, 1fr))`, gap 16px. Each card shows status pill inline with title.
- **Table view**: rows with columns `ID / Name + desc / Status / Progress % / Progress bar / Owner`. Clickable rows.

**Project card anatomy** (bold variant — see shadows above):
1. 3px gradient top rail (color varies by status: done→green/blue, bottleneck→orange/red, waiting→amber, planning→grey)
2. ID chip (`#258321t2`) in mono, `--gs-blue`, 10px
3. Title (Inter 15/600)
4. Description (only in Cards view; 2 lines)
5. Optional **bottleneck alert strip** (orange-tinted, with alert icon)
6. Progress — **segmented bar** in kanban (10 segments filling left-to-right, glowing when on) OR solid bar in cards/table
7. Bottom row: avatar circle + owner name + right-aligned `%` in mono

### 3. Project detail (modal over list)
Opens centered, max-width 960px, with a 3px gradient top border.
- **Head**: ID chip + status pill + right-aligned action buttons (Edit / Delete danger / Close). Below: Space Grotesk 28/700 title. Meta row in mono: `owner · Liviu  created · 22.04.2026  updated · 2h ago`. Full-width progress bar with `% · 1/4` tasks count.
- **Body grid**: `1.6fr 1fr`.
  - **Left column**: Description paragraph, Bottleneck callout (if any, orange gradient panel with alert icon), **Tasks list** (`Pași / Tasks` label + `1/4` chip + primary **Add** button). Task row = 18px rounded checkbox + text, bottom border between. Done tasks get strikethrough + muted color. Input at bottom "Adaugă un pas nou…".
  - **Right column**: Timeline label + primary **Update** button. Vertical 2px line with 12px gradient dots (older dots go grey). Each entry: `when` line in mono uppercase (`22.04.2026 · Liviu`), then one or more rows prefixed with a 10px mono status chip (`DONE` / `WAIT` / `NEXT`) and the text. Older entries collapse to a single grey paragraph.

### 4. Users (admin only)
- Topbar: "User management" + subtitle `admin / users · 4 accounts`. Right: Filter button, **Invite user** primary button.
- Stat row: Total / Admins (red) / Editors (blue) / Viewers (grey).
- Table: 5-column grid `52px 2fr 1fr 1fr 140px` for `# / User (avatar+name+email) / Role pill / Last seen / Actions (Edit + Delete danger)`. Row hover raises bg slightly. Avatars are 36px squircle (radius 10px) with the gradient fill and black initial.

### 5. Mobile screens (4)
All wrapped in a 380×780 phone frame with 42px notch area and a **bottom tab bar** (Projects · Stats · Team · Inbox).
1. **Login** — single column, 36px hero headline, same form.
2. **Projects list** — compact header (logo + "Projects" + 6 active), horizontal chip scroller for filters, stacked project cards (bold variant, 12px padding), **FAB** (54px gradient circle `+` at bottom-right, 10px blue glow) above the tab bar.
3. **Project detail** — back chevron + ID in header, title + status pill, progress bar, tab strip (Tasks / Timeline / Info — Tasks active with green underline), bottleneck callout, tasks list, bottom inline input + primary `+` button.
4. **Users (admin)** — back chevron + title + Invite, 3-up role stat cards, stacked user rows as bold cards with avatar + name + email + role pill.

---

## Icons
Inline SVGs in the prototype; map directly to **lucide-react**:
| Prototype id | Lucide name |
|---|---|
| `i-board` | `LayoutPanelLeft` (or `Columns3`) |
| `i-grid` | `LayoutGrid` |
| `i-list` | `List` |
| `i-users` | `Users` |
| `i-chart` | `LineChart` |
| `i-plus` | `Plus` |
| `i-search` | `Search` |
| `i-close` | `X` |
| `i-filter` | `Filter` |
| `i-trash` | `Trash2` |
| `i-edit` | `Pencil` |
| `i-back` | `ArrowLeft` |
| `i-bell` | `Bell` |
| `i-alert` | `AlertTriangle` |
| `i-logo-home` | `Home` |

Stroke width 1.75 for nav/actions, 2 for Plus/Close/Back.

---

## Interactions & Behavior

### Navigation
- Sidebar items switch main view (`projects` | `dashboard` | `users`). URL-route each: `/projects`, `/dashboard`, `/users`.
- Clicking a project card opens the detail **modal** (not a separate page). Close on backdrop click, ESC, or ✕.
- View toggle (Kanban / Cards / Table) is local UI state but should persist to `localStorage` as `projectsView`.
- Filter chip selection persists to URL query `?status=progress`.
- Search is `⌘K`-triggered; fuzzy across id, name, owner.

### Kanban drag-and-drop
- Drag card across columns to change status.
- Drag within a column to reorder.
- Optimistic update + PATCH to `/api/projects/:id`.
- Use `@dnd-kit/core` + `@dnd-kit/sortable`.

### Card hover (bold variant)
```
transition: all 200ms;
translate(-2px, -2px); /* lift */
shadow shifts: green-tinted (6/6) → blue-tinted (8/8)
border-color: var(--gs-blue)
```

### Task checkbox toggle
- Immediate visual flip (CSS transition 150ms).
- PATCH `/api/projects/:id/tasks/:taskId { done: true }`.
- Parent project `progress %` recalculates as `done/total * 100` rounded; update progress bar with a 300ms width transition.

### Timeline entry creation
"Update" button opens a small composer with status chip selector (DONE / WAIT / NEXT / BLOCK) and a text field. On save, prepend to timeline.

### Modal open/close
- Backdrop fade 200ms, modal scale 0.98→1 + translateY(-8px)→0 200ms ease-out.
- Scroll locks body.

### Ambient background
- Blobs animate via CSS `@keyframes drift1/2/3` — infinite, `ease-in-out`, `alternate`. Durations 24s / 30s / 35s.
- **Do not disable on mobile** but drop to one blob to save paint cost.

### Notifications / bell
Not wired in prototype — placeholder icon button. Plan: dropdown of last 10 events; unread count badge using `--st-bottleneck` orange.

---

## State Management

Client-side (Zustand or Context is fine — small surface):
```ts
type ProjectView = 'kanban' | 'cards' | 'table';
type StatusFilter = 'all' | 'planning' | 'progress' | 'waiting' | 'bottleneck' | 'done';

interface UIState {
  view: 'projects' | 'dashboard' | 'users';
  projectsView: ProjectView;         // persist localStorage
  filter: StatusFilter;              // sync URL query
  search: string;
  openProjectId: string | null;      // modal state
}
```

Server data via **TanStack Query** (`@tanstack/react-query`):
- `useProjects(filter)` → `GET /api/projects?status=...`
- `useProject(id)` → `GET /api/projects/:id` (includes tasks + timeline)
- `useUpdateTask`, `useCreateProject`, `useUpdateProject`, `useAddTimelineEntry` — mutations with optimistic updates.

---

## Data Model (Prisma suggestion)

```prisma
enum ProjectStatus { PLANNING PROGRESS WAITING BOTTLENECK DONE }
enum UserRole { ADMIN EDITOR VIEWER }
enum TimelineKind { DONE WAIT NEXT BLOCK NOTE }

model User {
  id        String   @id @default(cuid())
  email     String   @unique           // must end @globalsource.ro
  name      String
  role      UserRole @default(VIEWER)
  lastSeen  DateTime?
  projects  Project[] @relation("Owner")
  entries   TimelineEntry[]
}

model Project {
  id          String   @id           // human code like "258321t2"
  name        String
  description String
  status      ProjectStatus
  progress    Int      @default(0)   // 0..100, derived from tasks
  bottleneck  String?                // short reason text
  ownerId     String
  owner       User     @relation("Owner", fields: [ownerId], references: [id])
  tags        String[]
  tasks       Task[]
  timeline    TimelineEntry[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Task {
  id        String  @id @default(cuid())
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  text      String
  done      Boolean @default(false)
  order     Int
}

model TimelineEntry {
  id        String       @id @default(cuid())
  projectId String
  project   Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  authorId  String
  author    User         @relation(fields: [authorId], references: [id])
  kind      TimelineKind
  text      String
  createdAt DateTime     @default(now())
}
```

## Permissions
- **Admin**: all CRUD + Users page.
- **Editor**: CRUD on projects / tasks / timeline they can see. No Users page.
- **Viewer**: read-only. Hide Edit/Delete/Add buttons and drag handles.

Guard on the server (API route middleware) AND in the UI (conditional render).

---

## Assets
- `logo.png` — Global Source mark (included in this bundle). Used at 22–32px.
- **Fonts**: Inter, Space Grotesk, JetBrains Mono — via Google Fonts CDN or `next/font`.
- No other imagery.

---

## Files in this bundle
- `AI Project Tracker.html` — entry page; loads React/Babel CDN + the JSX component file. Contains **all CSS tokens, keyframes, and component styles** in one `<style>` block. This is the canonical visual source of truth.
- `hifi-app.jsx` — all React components (Login, Sidebar, Projects list/kanban/cards/table, ProjectModal, Users table, Mobile*). Uses plain React (no TS, no bundler). Read this for component structure, prop shapes, and the exact markup.
- `logo.png` — Global Source logo.
- `screenshots/` — rendered PNGs of every screen for quick visual reference:
  - `01-login-web.png` — Login page
  - `02-projects-kanban.png` — Projects list, Kanban view
  - `03-projects-cards.png` — Projects list, Cards view
  - `04-projects-table.png` — Projects list, Table view
  - `05-project-detail-modal.png` — Project detail modal (bottleneck case)
  - `06-users.png` — User management (admin)
  - `07-mobile-all.png` — Mobile screens (Login, Projects, Detail, Users)

Open the HTML file in a browser to see the full reference in context. Every section is labelled (`// Login · Web`, `// Projects + Detail · Web`, `// Mobile · iOS / Android`).

---

## Out of scope for v1 (but designed for)
- Dashboard view (sidebar item exists, page TBD — build after Projects ships).
- Inbox / notifications dropdown.
- Comments on tasks (only timeline for now).
- File attachments.
- Real-time collaboration (can be added via Liveblocks/Ably later).

## Questions to resolve with the team before building
1. Do we need Google SSO or email+password is fine for v1?
2. Should project IDs be user-provided or auto-generated? Prototype shows human-looking codes.
3. Timeline: do entries support editing/deletion, or append-only log?
4. Mobile: is this a PWA or do we ship a real native app later? Design assumes PWA for v1.
