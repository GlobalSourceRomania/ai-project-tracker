# AI Project Tracker

Professional project management dashboard for tracking AI projects with real-time status updates, team collaboration, and comprehensive user management.

## Features

### 📊 Project Dashboard
- **Project Cards**: Visual cards displaying project title + Pipedrive code
- **Quick View**: Click cards to expand and see full details
- **Status Tracking**: Planning → In Progress → Waiting → Completed
- **Responsive Design**: Desktop, tablet, and mobile support

### 📝 Project Details (Expanded View)
- **Owner Information**: See who owns each project
- **Timeline Updates**: Full history of what's been done, what's waiting, next steps
- **Add Updates**: Editor and admin users can add timeline entries
- **Status Badges**: Color-coded status indicators

### 👥 User Management
- **Admin Panel**: Full user CRUD operations
- **Role-Based Access**:
  - **Admin**: Full access + user management
  - **Editor**: Create/edit projects, add updates
  - **Viewer**: Read-only access (cards + details only)
- **User List**: View all accounts, roles, and creation dates

### 🔐 Authentication
- **Secure Login**: JWT tokens in httpOnly cookies
- **Email/Password**: Standard authentication
- **Session Management**: 7-day token expiration
- **Auto-Logout**: Sign out with one click

---

## Tech Stack

- **Frontend**: React 19, Next.js 16, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: JWT + bcryptjs
- **Hosting**: Vercel (with auto-deploy on push)
- **Language**: TypeScript (strict mode)

---

## Project Structure

```
ai-tracking/
├── app/
│   ├── login/page.tsx              # Login form
│   ├── projects/page.tsx           # Dashboard with project cards
│   ├── admin/
│   │   └── users/page.tsx         # User management panel
│   ├── api/
│   │   ├── auth/route.ts          # Login/logout endpoints
│   │   ├── projects/route.ts      # Project CRUD
│   │   ├── projects/[id]/updates/route.ts  # Timeline updates
│   │   ├── users/route.ts         # User management (admin)
│   │   └── setup/route.ts         # Database initialization
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── lib/
│   ├── db.ts                       # Database functions & schema
│   └── auth.ts                     # JWT & authentication utils
├── package.json
├── tsconfig.json
├── next.config.ts
└── GITHUB_VERCEL_SETUP.md         # GitHub + Vercel instructions
```

---

## Database Schema

### Users Table
```sql
id (PK), email (UNIQUE), password_hash, display_name, 
role (admin|editor|viewer), created_at, updated_at
```

### Projects Table
```sql
id (PK), title, pipedrive_code (UNIQUE), owner_id (FK), 
status (planning|in_progress|waiting|completed), 
created_at, updated_at
```

### Project Updates Table
```sql
id (PK), project_id (FK), author_id (FK), 
what_done, what_waiting, next_steps, created_at
```

---

## API Endpoints

### Authentication
- `POST /api/auth` - Login/logout
  - Body: `{ action: "login", email, password }`
  - Response: JWT token in httpOnly cookie

### Projects
- `GET /api/projects` - List all projects (or user's projects if viewer)
- `POST /api/projects` - Create new project (editor+)
  - Body: `{ title, pipedriveCode, status? }`
- `GET /api/projects/[id]/updates` - Get timeline for project
- `POST /api/projects/[id]/updates` - Add update (editor+)
  - Body: `{ whatDone?, whatWaiting?, nextSteps? }`

### Users (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
  - Body: `{ email, password, displayName, role }`
- `PUT /api/users` - Update user
  - Body: `{ userId, displayName?, role? }`
- `DELETE /api/users` - Delete user
  - Body: `{ userId }`

### Setup
- `POST /api/setup` - Initialize database & create default admin

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create `.env.local`:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-secret-key-here
```

Get PostgreSQL from [Neon](https://neon.tech) (free tier available).

### 3. Initialize Database

```bash
npm run dev
# Then visit http://localhost:3000/api/setup
```

This creates tables and default admin user:
- Email: `admin@example.com`
- Password: `password`

### 4. Start Development

```bash
npm run dev
```

Visit http://localhost:3000/login

---

## Default Credentials

**Email:** `admin@example.com`  
**Password:** `password`

⚠️ **IMPORTANT**: Change these immediately in production!

---

## Available Pages

### Public
- `/login` - Login form

### Protected (require authentication)
- `/projects` - Project dashboard
- `/admin/users` - User management (admin only)

---

## Permissions

### Viewer Role
✅ View project cards  
✅ Expand & read project details  
✅ View timeline updates  
❌ Create projects  
❌ Add updates  
❌ Manage users  

### Editor Role
✅ View all projects  
✅ Create new projects  
✅ Add timeline updates  
✅ Edit own projects  
❌ Manage users  
❌ Edit other users' projects  

### Admin Role
✅ Full access to everything  
✅ Create/edit/delete projects  
✅ Manage all users (create/update/delete)  
✅ View all timeline updates  
✅ System administration  

---

## Deployment

### GitHub Integration
See [GITHUB_VERCEL_SETUP.md](./GITHUB_VERCEL_SETUP.md) for complete instructions.

Quick summary:
1. Push code to GitHub
2. Connect to Vercel
3. Set `DATABASE_URL` in Vercel environment
4. Auto-deploy on every push

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format  # if available
```

---

## Performance & Optimization

- **Responsive Images**: Using Next.js Image optimization
- **Code Splitting**: Automatic route-based splitting
- **API Caching**: Force-dynamic for real-time data
- **Database Queries**: Parameterized to prevent SQL injection
- **Authentication**: Secure httpOnly cookies, no localStorage

---

## Security Considerations

- ✅ JWT tokens in httpOnly cookies (secure)
- ✅ Parameterized database queries (SQL injection prevention)
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control
- ✅ CORS protection (same-origin by default)
- ✅ Rate limiting recommended for production

**Production Checklist:**
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update default admin credentials
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set secure database connection
- [ ] Add rate limiting middleware
- [ ] Enable CORS if needed

---

## Monitoring & Debugging

### Local Development
- Check browser console for client errors
- Check terminal for server logs
- Use Network tab to debug API calls
- Test login at `/api/auth`

### Production (Vercel)
- View deployment logs in Vercel dashboard
- Check function logs for API errors
- Monitor PostgreSQL connection limits
- Set up error tracking (Sentry recommended)

---

## Common Issues

### Login Loop
- Check JWT_SECRET is set consistently
- Verify database connection
- Clear browser cookies

### Database Connection Error
- Verify DATABASE_URL is correct
- Check PostgreSQL is running (Neon)
- Test connection string locally

### API Returning 401
- User not authenticated
- Login first at `/login`
- Check token in cookies (browser DevTools)

### Project Not Showing
- Verify role permissions (viewer may only see assigned)
- Check project exists in database
- Refresh page

---

## Future Enhancements

- [ ] Email notifications on project updates
- [ ] Project templates
- [ ] Bulk project import
- [ ] Advanced filtering & search
- [ ] Gantt chart view
- [ ] Team collaboration comments
- [ ] Audit logs
- [ ] Two-factor authentication
- [ ] Dark mode toggle (already dark-themed, light mode option)
- [ ] Export to CSV/PDF

---

## Support & Documentation

- See [GITHUB_VERCEL_SETUP.md](./GITHUB_VERCEL_SETUP.md) for deployment
- Check Next.js docs: https://nextjs.org
- PostgreSQL docs: https://www.postgresql.org/docs/
- Vercel docs: https://vercel.com/docs

---

## License

Proprietary - All rights reserved

---

**Last Updated:** April 22, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
