# AI Project Tracker — Visual Component Catalog

## Component Specifications with ASCII Diagrams

---

## 1. BUTTON VARIATIONS

### Primary Button (`.btn.primary`)

**Visual:**
```
┌──────────────────────┐
│ ➕ New project       │  ← Gradient background (#8dd13a → #2ba8d9)
│                      │     Dark text (#07090d)
└──────────────────────┘     No border, slight glow shadow
```

**Specs:**
- Padding: 8px 14px (expandable)
- Border-radius: 8px
- Font: Inter 13px, 600 weight
- Gap between icon + text: 6px
- Box-shadow: 0 4px 14px rgba(43,168,217,0.25)
- Hover: shadow increases, translateY(-1px)
- Icon size: 14px

**States:**
```
Enabled:   [gradient] dark text, glow shadow
Hover:     Same + lift up 1px + stronger glow
Disabled:  Opacity 0.5, cursor: not-allowed
```

### Secondary Button (`.btn`)

**Visual:**
```
┌──────────────────────┐
│ 📝 Edit status       │  ← Semi-transparent border
│                      │     Light text, no fill
└──────────────────────┘
```

**Specs:**
- Padding: 8px 14px
- Border: 1px solid #2a364d (var(--line-2))
- Background: rgba(255,255,255,0.03) — very subtle fill
- Border-radius: 8px
- Font: Inter 13px, 500 weight
- Color: var(--ink) — light
- Hover: border → #6b768b, background → rgba(255,255,255,0.06)

### Ghost Button (`.btn.ghost`)

**Visual:**
```
┌──────────────────────┐
│ ✕ Close              │  ← No visible border/fill
│                      │     Only shows on hover
└──────────────────────┘
```

**Specs:**
- Padding: 8px 14px
- Border: transparent
- Background: transparent
- Hover: background → rgba(255,255,255,0.05)
- Great for secondary actions, close buttons

### Danger Button (`.btn.danger`)

**Visual:**
```
┌──────────────────────┐
│ 🗑️ Delete            │  ← Red text, subtle red border
│                      │     Danger red hover background
└──────────────────────┘
```

**Specs:**
- Color: #e64b4b (var(--danger))
- Border: 1px solid rgba(230,75,75,0.25) — red, 25% opacity
- Background: transparent
- Hover: background → rgba(230,75,75,0.08), border → #e64b4b

### Small Button (`.btn.sm`)

**Visual:**
```
┌──────────┐
│ ✓ Save   │  ← Smaller padding & font
└──────────┘
```

**Specs:**
- Padding: 5px 10px (vs 8px 14px)
- Font-size: 12px (vs 13px)
- All other properties same as base button

---

## 2. CARD COMPONENTS

### Standard Card (`.card`)

**Visual:**
```
╔════════════════════════╗
║                        ║  ← Rounded corner 14px
║  Card content          ║     Light border, inset highlight
║                        ║     Subtle shadow below
╚════════════════════════╝
```

**Specs:**
- Background: #111722 (var(--surface))
- Border: 1px solid #1f2a3d (var(--line))
- Border-radius: 14px
- Box-shadow: 
  - Inset: 0 1px 0 rgba(255,255,255,0.04)
  - Below: 0 20px 40px -20px rgba(0,0,0,0.5)

### Bold Project Card (`.card.bold`)

**Visual:**
```
┌────────────────────────┐
│                    ┐   │  ← Colored rail at top (3px)
│  ┌─ GREEN ACCENT  │   │
│  │  Project Card  │   │  ← Offset drop shadow (6px)
│  │  • Title       │   │     Hover: shadow increases,
│  │  • Progress    │   │     card lifts up-left
│  │  • Owner       │   │
└────────────────────────┘
    6px offset shadow
```

**Specs:**
- Padding: 0 (internal structure)
- Border: 1px solid var(--line-2)
- Border-radius: 14px
- Box-shadow: 
  - Normal: 6px 6px 0 rgba(141,209,58,0.08)
  - Hover: 8px 8px 0 rgba(43,168,217,0.15)
- Transition: 0.2s all
- Transform on hover: translate(-2px, -2px)

**Rail Colors by Status:**
- Planning: #6b768b → #aab3c5 gradient
- In Progress: green → blue (default grad)
- Waiting: #e8a73a → #e8863a
- Bottleneck: #e8863a → #e64b4b
- Done: #2ba8d9 → #8dd13a

---

## 3. PROJECT CARD STRUCTURE

```
┌─────────────────────────┐
│ ███ Rail (3px)          │  ← Colored bar by status
├─────────────────────────┤
│ #260422z1               │  ← ID chip (monospace, cyan)
│ Project Title Here      │  ← 15px, 600 weight
│ [!] Bottleneck message  │  ← Alert if bottleneck status
│ ▮▮▮▮▮▯▯▯▯▯ (50%)        │  ← Segmented progress (10 units)
│ [Avatar] Owner Name 50% │  ← Bottom: avatar, name, % right-aligned
└─────────────────────────┘
   240px width (Kanban)
```

**Content Breakdown:**
1. **Rail** (3px colored bar, top) — Status indicator
2. **Body** (16px padding):
   - **ID Chip**: `#260422z1` — JetBrains Mono, 10px, #2ba8d9
   - **Title**: 15px, 600 weight, line-height 1.3
   - **Description** (optional): 12.5px, secondary color, 1.5 line-height
   - **Alert Strip** (if bottleneck):
     - Background: rgba(232,134,58,0.1)
     - Border: 1px rgba(232,134,58,0.25)
     - Text: #f0c094, 11px
     - Icon: alert icon, 12px
     - Padding: 6px 8px
     - Border-radius: 6px
   - **Progress Bar** (segmented):
     - 10 segments representing 10% each
     - On: gradient green→blue
     - Off: rgba(255,255,255,0.08)
     - Gap: 2px between segments
     - Height: 5px
   - **Bottom Row** (flex, space-between):
     - **Avatar**: 22px circular, gradient background, centered initial
     - **Owner Name**: 11px, tertiary color
     - **Percentage**: 11px monospace, right-aligned

---

## 4. INPUT FIELD VARIATIONS

### Text Input (`.input`)

**Visual:**
```
FIELD LABEL
┌─────────────────────────┐
│ Placeholder text...     │  ← Background: rgba(255,255,255,0.03)
└─────────────────────────┘     Border: #2a364d
```

**Specs:**
- Width: 100% (fills container)
- Height: 40px (10px top/bottom padding + 14px font + line)
- Padding: 10px 12px
- Border: 1px solid var(--line-2) (#2a364d)
- Border-radius: 8px
- Background: rgba(255,255,255,0.03)
- Font: Inter 14px, 400 weight
- Color: var(--ink)
- Placeholder: var(--ink-3)
- Outline: none

**Focus State:**
```
┌─────────────────────────┐
│ Text here               │  ← Border: var(--gs-blue) #2ba8d9
└─────────────────────────┘     Background: rgba(43,168,217,0.05)
    Ring glow: 3px rgba(43,168,217,0.1)
```

### Textarea (`.input` with textarea tag)

- Min-height: 70px
- Resize: vertical
- Same styling as input

### Select Dropdown (`.input` with select tag)

**Visual:**
```
┌─────────────────────────┐
│ Planning            ▼   │  ← Custom dropdown arrow
└─────────────────────────┘
```

**Specs:**
- Appearance: none (custom styling)
- Background-image: Down arrow SVG
- Background-position: right 10px center
- Padding-right: 32px (for arrow)
- Option background: var(--surface) (#111722)
- Option color: var(--ink)

### Form Label (`.label`)

**Visual:**
```
FIELD LABEL
┌──────────────┐
│              │  ← Monospace, 10px, uppercase
└──────────────┘
```

**Specs:**
- Font: JetBrains Mono, 10px, 500 weight
- Color: var(--ink-2) (#aab3c5)
- Text-transform: uppercase
- Letter-spacing: 0.08em
- Margin-bottom: 6px
- Display: block

---

## 5. STATUS & ROLE CHIPS

### Status Chip (`.chip.st-{status}`)

**Visual:**
```
● In Progress  ← Color dot + text label
```

**Specs (all variants):**
- Display: inline-flex
- Align-items: center
- Gap: 5px
- Padding: 3px 9px
- Border-radius: 6px
- Font: JetBrains Mono, 11px, 500 weight
- Letter-spacing: 0.02em
- Border: 1px solid (transparent or status-colored)
- White-space: nowrap

**Color Variants:**

| Status | Color | Background | Border |
|--------|-------|------------|---------|
| Planning | #aab3c5 | rgba(170,179,197,0.08) | rgba(170,179,197,0.2) |
| Progress | #8dd13a | rgba(141,209,58,0.1) | rgba(141,209,58,0.3) |
| Waiting | #e8a73a | rgba(232,167,58,0.08) | rgba(232,167,58,0.25) |
| Bottleneck | #e8863a | rgba(232,134,58,0.1) | rgba(232,134,58,0.3) |
| Done | #2ba8d9 | rgba(43,168,217,0.1) | rgba(43,168,217,0.3) |

### Role Chip (`.chip.role-{role}`)

| Role | Color | Background | Border |
|------|-------|------------|---------|
| Admin | #e64b4b (red) | rgba(230,75,75,0.08) | rgba(230,75,75,0.25) |
| Editor | #2ba8d9 (blue) | rgba(43,168,217,0.1) | rgba(43,168,217,0.3) |
| Viewer | #aab3c5 (gray) | rgba(170,179,197,0.08) | rgba(170,179,197,0.2) |

---

## 6. CHECKBOX COMPONENT

### Unchecked State

**Visual:**
```
□ Task title here
```

**Specs:**
- Width/Height: 18px
- Border: 1.5px solid var(--line-2) (#2a364d)
- Border-radius: 5px
- Background: transparent
- Cursor: pointer
- Transition: 0.15s all
- Hover: border-color → var(--gs-green) (#8dd13a)

### Checked State

**Visual:**
```
✓ Task title here (strikethrough, gray)
```

**Specs:**
- Background: var(--grad) (green → blue gradient)
- Border: transparent
- Content: '✓' checkmark, 11px, 800 weight
- Text: strikethrough, color → var(--ink-3)
- Task text line-height: 1 (centered)

---

## 7. PROGRESS BARS

### Standard Progress Bar

**Visual:**
```
Progress
┌──────────────────────────┐
│███████░░░░░░░░░░░░░░░░░░│ ← 50% filled
└──────────────────────────┘
```

**Specs:**
- Height: 6px
- Background: rgba(255,255,255,0.06) — off color
- Border-radius: 3px
- Overflow: hidden
- **Fill (span):**
  - Height: 100%
  - Background: var(--grad)
  - Box-shadow: 0 0 12px rgba(43,168,217,0.4) — blue glow
  - Transition: width 0.3s ease
  - Border-radius: 3px

### Segmented Progress (Kanban Cards)

**Visual:**
```
▮▮▮▮▮▯▯▯▯▯  ← 10 segments, 50% = 5 on
```

**Specs:**
- Display: flex
- Gap: 2px
- Height: 5px
- Background: transparent
- Overflow: visible
- **Each segment (i):**
  - Flex: 1
  - Background (off): rgba(255,255,255,0.08)
  - Background (on): var(--grad)
  - Box-shadow (on): 0 0 8px rgba(141,209,58,0.4) — green glow
  - Border-radius: 1px

---

## 8. MODAL STRUCTURE

```
╔════════════════════════════════════════════════════════╗
│ ███ Accent stripe at top (3px gradient)               ║
├────────────────────────────────────────────────────────┤
│ #260422z1 [● In Progress]        [Edit] [Delete] [✕] │ ← Header
│ Project Title (26px)                                   ║
│ owner · Alice  created · 12.04.26  updated · 3m ago   ║
│                                                        ║
│ Progress ┌──────░░░░░░┐ 50% · 5/10                    ║
├────────────────────────────────────────────────────────┤
│ LEFT (1.6fr)              │ RIGHT (1fr)                ║
│                           │                             ║
│ Description               │ Timeline                    ║
│ ─────────────            │ ─────────                   ║
│ Project overview...      │ ● 12.04.26 · Alice         ║
│                           │ [DONE] Done something      ║
│ [Edit]                    │ [WAIT] Waiting for Bob     ║
│                           │ [NEXT] Next steps...       ║
│ Bottleneck                │ [✎] [🗑]                   ║
│ ─────────────            │                             ║
│ [!] BOTTLENECK           │ ● 11.04.26 · Bob            ║
│ Current blocking issue    │ [DONE] Completed feature   ║
│                           │                             ║
│ [Edit]                    │ + Update                    ║
│                           │                             ║
│ Tasks (5/10)              │                             ║
│ ──────────────            │                             ║
│ ✓ Task 1 (strikethrough) │                             ║
│ □ Task 2                 │                             ║
│ [+ Add task]             │                             ║
├────────────────────────────────────────────────────────┤
```

**Modal Specs:**
- Max-width: 960px
- Border-radius: 16px
- Border: 1px solid var(--line)
- Background: var(--surface)
- Box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(141,209,58,0.08)

**Header:**
- Padding: 24px 28px 20px
- Border-bottom: 1px solid var(--line)
- ID chip, status badge, buttons, title, meta, progress

**Body:**
- Padding: 24px 28px
- Grid: 1.6fr (description/tasks) | 1fr (timeline)
- Gap: 24px
- Responsive: mobile → stacks to 1 column

---

## 9. SIDEBAR STRUCTURE

```
┌──────────────────┐
│ [Logo] Global    │  ← Brand (30px logo, "Global Source", "AI projects tracker")
│       Source     │     Border-bottom
│       projects   │
├──────────────────┤
│ WORKSPACE        │  ← Nav label (uppercase, 10px, tertiary)
│ 📋 Projects   3  │  ← Nav item (icon, label, count badge)
│ 📊 Statistics    │
│ 🔔 Inbox      2  │  ← Unread count (blue background)
│ 👥 Users      5  │  ← Admin only
├──────────────────┤
│ [Avatar] Alice   │  ← User chip (footer)
│ EDITOR           │     Gradient avatar, name, role badge
└──────────────────┘
```

**Sidebar Specs:**
- Width: 248px
- Padding: 20px 14px
- Background: rgba(11,15,21,0.72) with blur(24px)
- Border-right: 1px solid var(--line)
- Position: sticky, height 100vh, overflow-y auto
- Display: flex flex-direction column (footer uses margin-top auto)

**Nav Item:**
- Padding: 8px 10px
- Border-radius: 8px
- Font: 13px, secondary color
- Border-left: 2px solid transparent
- **Active state:**
  - Background: var(--grad-soft) — soft gradient overlay
  - Border-left: green
  - Color: primary
  - Font-weight: 500

**Nav Count Badge:**
- Padding: 1px 7px
- Border-radius: 10px
- Font: 10px monospace
- Background: rgba(255,255,255,0.06)
- Color: secondary
- Margin-left: auto
- **Unread variant:**
  - Background: var(--gs-blue)
  - Color: white

**Brand Section:**
- Display: flex gap 10px, align center
- Logo: 30×30px
- Name: 15px 700 weight
- Sub: 9px monospace uppercase letter-spacing 0.15em
- Padding-bottom: 18px
- Border-bottom: 1px var(--line)
- Margin-bottom: 14px

**User Chip (Footer):**
- Display: flex gap 10px
- Padding: 8px
- Border-radius: 8px
- Cursor: pointer
- Hover: background rgba(255,255,255,0.03)
- **Avatar:** 32×32px circular, gradient background, initials
- **Name:** 13px 500 weight, overflow hidden
- **Role:** 10px monospace, green, uppercase

---

## 10. TOPBAR STRUCTURE

```
┌─────────────────────────────────────────────────────────┐
│ Projects  [🔍 Search projects, IDs... ⌘K] [+ New] ┐   │
└─────────────────────────────────────────────────────────┘
```

**Topbar Specs:**
- Display: flex gap 14px, align center
- Padding: 18px 28px
- Border-bottom: 1px var(--line)
- Background: rgba(11,15,21,0.6) with blur(16px)
- Position: sticky top 0, z-index 10

**Title (h1):**
- Font: Space Grotesk 22px 700 weight
- Letter-spacing: -0.01em
- Margin: 0
- Color: primary

**Search Box:**
- Display: flex gap 10px, align center
- Flex: 1, max-width 440px
- Padding: 8px 12px
- Background: rgba(255,255,255,0.03)
- Border: 1px solid var(--line)
- Border-radius: 10px
- **Input:**
  - Border: none
  - Background: transparent
  - Outline: none
  - Font: inherit
  - Color: primary
- **On focus:**
  - Border-color: var(--gs-blue)
  - Background: rgba(43,168,217,0.05)
- **Icon:** 15px, tertiary
- **Kbd hint:** Monospace, 10px, on far right
  - Background: rgba(0,0,0,0.3)
  - Border: 1px var(--line-2)
  - Padding: 1px 5px
  - Border-radius: 4px

**Buttons:**
- Primary button for "New project"
- Hidden on mobile (use FAB instead)

---

## 11. KANBAN BOARD

```
┌─────────────────┬─────────────────┬─────────────────┐
│ ● PLANNING (2)  │ ● IN PROGRESS (3) │ ● WAITING (1)  │
├─────────────────┼─────────────────┼─────────────────┤
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐ │
│ │ [rail]      │ │ │ [rail]      │ │ │ [rail]      │ │
│ │ #260422z1   │ │ │ #260422z2   │ │ │ #260422z3   │ │
│ │ Title Here  │ │ │ Title Here  │ │ │ Title Here  │ │
│ │ ▮▮▮░░░░░░░░ │ │ │ ▮▮▮▮▮▮░░░░░ │ │ │ ▮▮░░░░░░░░░ │ │
│ │ [Avatar] 30%│ │ │ [Avatar] 60%│ │ │ [Avatar] 20%│ │
│ └─────────────┘ │ └─────────────┘ │ └─────────────┘ │
│ ┌─────────────┐ │ ┌─────────────┐ │                 │
│ │ ... more    │ │ │ ... more    │ │                 │
│ └─────────────┘ │ └─────────────┘ │                 │
│ [+ add card]    │ [+ add card]    │ [+ add card]    │
└─────────────────┴─────────────────┴─────────────────┘
```

**Kanban Grid Specs:**
- Display: grid
- Grid-template-columns: repeat(5, minmax(240px, 1fr))
- Gap: 14px
- Padding: 0 24px 24px
- Overflow-x: auto

**Column:**
- Display: flex flex-direction column
- Gap: 10px
- Min-height: 400px

**Column Header:**
- Display: flex gap 8px, align center
- Padding: 10px 12px
- Background: var(--surface)
- Border: 1px solid var(--line)
- Border-radius: 10px
- **Top border (2px):** Colored by status
- **Color dot:** 8×8px
- **Title:** 12px 600 weight
- **Count:** 10px monospace, auto margin-left

**Add Card Button:**
- Border: 1px dashed var(--line-2)
- Border-radius: 10px
- Padding: 10px
- Text-align: center
- Font: 12px
- Color: tertiary
- Background: transparent
- Hover: border → blue, color → blue
- Cursor: pointer

---

## 12. TIMELINE COMPONENT

```
│ ● Latest Update
│  12.04.26 · Alice
│  [DONE] Completed database schema
│  [WAIT] Waiting for design approval
│  [NEXT] Implement API endpoints
│  [✎] [🗑]
│
│ ● Older Update  (gray dot instead of gradient)
│  11.04.26 · Bob
│  [DONE] Setup project structure
│  [EDIT] [DELETE]
│
│ ○ Even Older  (tertiary color dot)
```

**Timeline Specs:**
- Position: relative
- Padding-left: 22px
- Border-left: 2px solid var(--line)

**Timeline Item:**
- Position: relative
- Padding-bottom: 18px
- **Dot (first item):**
  - Position: absolute left -29px top 4px
  - Size: 12×12px
  - Border-radius: 50%
  - Background: var(--grad)
  - Box-shadow: 0 0 0 3px var(--surface), 0 0 12px rgba(141,209,58,0.4)
- **Dot (older items):**
  - Background: var(--ink-3)
  - Box-shadow: 0 0 0 3px var(--surface)

**When (timestamp):**
- Font: JetBrains Mono 10px uppercase
- Color: tertiary
- Letter-spacing: 0.05em

**Timeline Row (tl-row):**
- Display: flex gap 8px, align flex-start
- Font: 13px, primary color
- Line-height: 1.5
- **Label (.k):**
  - Padding: 1px 7px
  - Border-radius: 4px
  - Font: JetBrains Mono 10px 600 weight
  - Letter-spacing: 0.03em
  - Flex-shrink: 0
  - Colors:
    - [DONE]: green background, done color
    - [WAIT]: orange background, orange color
    - [NEXT]: blue background, blue color

---

## 13. EMPTY STATE

```
┌─────────────────────────┐
│                         │
│   No projects yet       │  ← Display font 22px 700 weight
│                         │     Centered
│  Start tracking your    │  ← Secondary text 13px
│  AI integrations.       │
│                         │
│  [+ Create your first]  │  ← Primary button
│                         │
└─────────────────────────┘
```

**Specs:**
- Padding: 40px 28px (container)
- Card padding: 36px
- Text-align: center
- Card: standard styling

---

## 14. NOTIFICATION TOAST

```
    ┌────────────────────────────────┐
    │ ✓ Project created!             │  ← Green background
    └────────────────────────────────┘     with border
```

**Specs:**
- Position: fixed top 16px right 16px
- Z-index: 100
- Padding: 10px 14px
- Border-radius: 10px
- Font: 13px
- Background: rgba(141,209,58,0.15) — soft green
- Border: 1px solid rgba(141,209,58,0.4) — green
- Color: var(--gs-green)
- Box-shadow: 0 10px 30px rgba(0,0,0,0.5)
- Max-width: calc(100vw - 32px)
- Auto-dismiss: 3 seconds

---

## 15. BOTTLENECK WARNING BOX

```
┌─────────────────────────────────────────┐
│ ⚠️ BOTTLENECK                           │  ← Orange icon + label
│                                         │
│ Current blocking issue that prevents... │  ← Warm beige text
│ further progress on this task.          │
└─────────────────────────────────────────┘
```

**Specs:**
- Padding: 14px 16px
- Border-radius: 12px
- Background: linear-gradient(135deg, rgba(232,134,58,0.12), rgba(230,75,75,0.05))
- Border: 1px solid rgba(232,134,58,0.3)
- **Label (.lbl):**
  - Display: flex gap 6px, align center
  - Font: JetBrains Mono 10px 700 weight uppercase
  - Letter-spacing: 0.12em
  - Color: var(--warn) (#e8863a)
  - Margin-bottom: 6px
  - Icon: 12px
- **Text (.txt):**
  - Font: 13.5px line-height 1.5
  - Color: #f0c094 — warm beige

---

## 16. STATS CARD

```
┌──────────────────┐
│ ACTIVE           │  ← Label (10px uppercase monospace)
│ 3                │  ← Number (28px display font 700)
│ ─────────────────│  ← Spark line (2px gradient, bottom)
└──────────────────┘
```

**Specs (4-column grid on desktop, 2 on mobile):**
- Padding: 14px 16px
- Border: 1px solid var(--line)
- Border-radius: 12px
- Background: var(--surface)
- Position: relative
- Overflow: hidden
- **Label (.l):**
  - Font: JetBrains Mono 10px 600 weight uppercase
  - Color: tertiary
  - Letter-spacing: 0.12em
- **Number (.n):**
  - Font: Space Grotesk 28px 700 weight
  - Margin-top: 4px
  - Color: primary
  - Letter-spacing: -0.02em
  - **Gradient variant:**
    - Background: var(--grad)
    - Background-clip: text
    - -webkit-text-fill-color: transparent
- **Spark (.spark):**
  - Position: absolute bottom 0 left 0 right 0
  - Height: 2px
  - Background: var(--grad)
  - Opacity: 0.5

---

## 17. LOGIN PAGE LAYOUT

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│  Global Source       │  [Logo] Global Source │
│  AI projects         │                      │
│  tracking.           │  Sign in             │
│                      │                      │
│  Every project       │  [Email input]       │
│  change in one       │  [Password input]    │
│  place.              │  [Sign in button]    │
│                      │                      │
│  AI vision           │  Need access?        │
│  24/7 tracking       │  Contact your admin. │
│  PWA android·ios     │                      │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

**Left Side:**
- Padding: 48px
- Flex column, center vertically
- **Badge:** var(--grad-soft), 11px monospace, uppercase, rounded 999px
- **Heading:** Space Grotesk 56px 700 weight 1.05 line-height -0.025em letter spacing
- **Description:** 16px secondary, max-width 440px, line-height 1.6
- **Feature Pills:** 30px display font 700, with 10px monospace labels, 3-column layout

**Right Side:**
- Padding: 48px
- Background: var(--surface)
- Border-left: 1px var(--line)
- Flex column, center vertically
- **Header:** 32px logo + brand name
- **Title:** Space Grotesk 26px 600 weight
- **Description:** 13px secondary
- **Form:** Standard form styling (labels, inputs, button)
- **Footer:** 11px tertiary text, centered

---

## 18. MOBILE BOTTOM NAVIGATION

```
┌─────────────────────────────────────┐
│ 📋 📊 👥 🔔 [Menu]                  │  ← Tabs + menu button
│ Projects Stats Team Inbox           │
└─────────────────────────────────────┘
  ▔▔▔▔▔  (Active indicator for Projects)
```

**Tabbar Specs:**
- Position: fixed bottom 0 left 0 right 0
- Display: flex
- Border-top: 1px var(--line)
- Background: rgba(11,15,21,0.92) with blur(14px)
- Padding: 6px 0 calc(8px + safe-area-inset-bottom)
- Z-index: 40

**Tab Item:**
- Flex: 1
- Display: flex flex-direction column
- Align-items: center gap 3px
- Padding: 6px 0
- Font: 10px
- Color: tertiary
- Background: transparent
- Border: 0
- Cursor: pointer
- **Active state:**
  - Color: var(--gs-green)
  - Top bar indicator: 2px gradient, 28% left/right, 0 0 2px 2px border-radius
- **Icon:** 20×20px
- **Unread badge** (Inbox):
  - Position: absolute top -4px right -6px
  - Min-width: 16px height 16px
  - Background: var(--gs-blue)
  - Color: white
  - Font: 10px 700 weight
  - Border-radius: 8px
  - Padding: 0 3px
  - Display: "1"–"99+"

---

## 19. FAB (Floating Action Button)

```
        ┌───┐
        │ + │  ← Gradient background
        └───┘     Glow shadow below
       (54×54px, fixed bottom-right)
```

**Specs:**
- Position: fixed bottom calc(86px + safe-area-inset-bottom) right 18px
- Width/Height: 54px (27px radius border-radius)
- Background: var(--grad)
- Color: #07090d (dark text on gradient)
- Display: flex align-center justify-center
- Font-size: 24px 300 weight
- Box-shadow: 0 10px 30px rgba(43,168,217,0.5)
- Z-index: 41
- Border: 0
- Hidden on desktop (>901px)

---

## 20. TABLE (Users Page)

```
╔════════════════════════════════════════════════════════════════╗
║ # │ USER            │ ROLE      │ STATUS     │ ACTIONS        ║
╠════════════════════════════════════════════════════════════════╣
║ 1 │ [A] Alice       │ Editor    │ Active     │ [Edit] [Delete]║
║   │ alice@gs.ro     │           │            │                ║
╠════════════════════════════════════════════════════════════════╣
║ 2 │ [B] Bob         │ Viewer    │ Active     │ [Edit] [Delete]║
║   │ bob@gs.ro       │           │            │                ║
╚════════════════════════════════════════════════════════════════╝
```

**Table Specs:**
- Border: 1px solid var(--line)
- Border-radius: 12px
- Overflow: hidden
- Background: var(--surface)
- **Head row:**
  - Padding: 12px 20px
  - Border-bottom: 1px var(--line)
  - Font: JetBrains Mono 10px 600 weight uppercase
  - Color: tertiary
  - Letter-spacing: 0.15em
  - Grid: 52px 2fr 1fr 1fr 140px
  - Gap: 14px
- **Data rows:**
  - Padding: 14px 20px
  - Border-bottom: 1px var(--line)
  - Grid: same as head
  - Hover: background → rgba(255,255,255,0.02)
  - **Avatar:** 36×36px, gradient, 14px font
  - **Name:** 14px 600 weight
  - **Email:** 12px monospace, tertiary, word-break break-all
- **Mobile:** Stacks to card layout, head hidden

---

## Summary

All components follow these principles:
- **Hierarchy:** Large/bright for primary, gray for secondary/tertiary
- **Spacing:** Consistent 4px base grid
- **Radius:** 8px standard, 14px large, 50% circles
- **Shadows:** Subtle inset on light elements, depth below dark elements
- **Transitions:** 0.15s for fast feedback, 0.2s for major changes
- **Typography:** 3-font system (Sans/Display/Mono) with clear weights
- **Colors:** 3-tone dark theme + 2 accent colors (green/blue) + semantic colors
- **Responsive:** Hidden/shown elements at breakpoints, not resized
- **Touch:** 44px minimum targets on mobile, safe-area padding

