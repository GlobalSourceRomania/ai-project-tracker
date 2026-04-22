# GitHub & Vercel Setup Guide

## 1. Initial Database Setup

Before deploying, initialize the database:

```bash
# Make sure DATABASE_URL is set in .env.local
curl -X POST http://localhost:3000/api/setup
```

This creates:
- Users table
- Projects table  
- Project updates table
- Default admin user: `admin@example.com` / `password`

---

## 2. GitHub Setup

### Create Repository

```bash
# Navigate to project root
cd /c/Users/Admin/Desktop/ai-tracking/ai-tracking

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: AI Project Tracker - initial setup

- Database schema for users, projects, project_updates
- Authentication with JWT
- Project CRUD API
- User management API
- Project dashboard with timeline
- Admin panel for user management
- Responsive design (mobile + desktop)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/ai-project-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 3. Vercel Deployment

### Method 1: Direct CLI Deployment

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to Vercel
npx vercel --prod

# Follow prompts to:
# - Connect GitHub account
# - Link to your GitHub repo
# - Set up production environment
```

### Method 2: GitHub Integration (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repo `ai-project-tracker`
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `DATABASE_URL` = Your Neon PostgreSQL connection string
   - Add: `JWT_SECRET` = A secure random string (for production)
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically builds and deploys
   - Your site is live at `https://ai-project-tracker.vercel.app`

---

## 4. Auto-Deploy on Push

After GitHub integration is set up, every push to `main` automatically triggers:
1. Vercel builds the project
2. Runs any build scripts
3. Deploys to production

No additional commands needed!

---

## 5. Environment Variables

### Local Development (.env.local)

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=dev-secret-key-change-in-production
```

### Production (Vercel)

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-secure-random-key-here
```

---

## 6. First Time Setup on Vercel

After first deployment, initialize the database on Vercel:

```bash
# Make request to your Vercel production URL
curl -X POST https://ai-project-tracker.vercel.app/api/setup

# Response: {"ok": true, "message": "Database initialized..."}
```

---

## 7. Useful Commands

```bash
# Check deployment status
npx vercel --prod

# View logs
npx vercel logs https://ai-project-tracker.vercel.app

# Rollback to previous deployment
# (Available in Vercel dashboard → Deployments → Select → Redeploy)

# Local development
npm run dev

# Production build locally
npm run build
npm start
```

---

## 8. Troubleshooting

### Database Connection Fails
- Verify `DATABASE_URL` is set correctly in Vercel
- Check Neon PostgreSQL IP whitelist allows Vercel IPs
- Test locally first: `npm run dev`

### Login Not Working
- Check browser console for errors
- Verify `/api/auth` endpoint is reachable
- Ensure `JWT_SECRET` is set in production

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Check for TypeScript errors: `npm run build` locally

---

## 9. Monitoring

### Vercel Analytics
- Dashboard shows deployment history
- View build logs and errors
- Monitor performance metrics

### Enable Additional Monitoring (Optional)
- Add Vercel Analytics: Already configured in layout
- Add Sentry for error tracking: `npm install @sentry/nextjs`
- Add monitoring webhooks in Vercel settings

---

**Done!** Your AI Project Tracker is now live on Vercel with auto-deploy on every push. 🚀
