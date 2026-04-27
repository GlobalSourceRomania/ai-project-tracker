# Migration Plan: Conditional Pipedrive Codes & New Statuses

## Changes Required

### 1. Database Changes

**Status:** planning, demo (NO pipedrive code required)
**Status:** in_progress, bottleneck, completed (pipedrive code REQUIRED)

#### SQL Commands to Run:

```sql
-- 1. Make pipedrive_code nullable
ALTER TABLE projects 
MODIFY COLUMN pipedrive_code TEXT NULL;

-- Alternative for PostgreSQL:
ALTER TABLE projects 
ALTER COLUMN pipedrive_code DROP NOT NULL;

-- 2. Remove the unique constraint (since some will be NULL)
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_pipedrive_code_unique;

-- 3. Add unique constraint for non-NULL values only
ALTER TABLE projects
ADD CONSTRAINT projects_pipedrive_code_unique 
UNIQUE (LOWER(pipedrive_code)) 
WHERE pipedrive_code IS NOT NULL;

-- 4. Update status check constraint
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('planning', 'demo', 'in_progress', 'waiting', 'bottleneck', 'completed'));

-- 5. New projects can have NULL pipedrive_code
-- Existing projects stay unchanged
```

### 2. Code Changes

Files to modify:
- [ ] `/lib/db.ts` - Update migration logic
- [ ] `/app/api/projects/route.ts` - Update POST endpoint
- [ ] `/app/api/projects/[id]/route.ts` - Update PUT endpoint
- [ ] `/app/projects/page.tsx` - Update UI for new status
- [ ] `/app/stats/page.tsx` - Add new status to stats

### 3. Validation Logic

```
When creating/updating project:
- If status = "planning" OR "demo" → pipedrive_code can be NULL or empty
- If status = "in_progress" OR "bottleneck" OR "completed" → pipedrive_code REQUIRED

When editing project:
- Can change status freely
- If new status requires pipedrive_code, ensure it's provided
```
