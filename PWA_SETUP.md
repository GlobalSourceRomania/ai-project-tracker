# PWA Setup & Deployment Guide

## 🚀 What's Implemented

This is a fully functional **Progressive Web App (PWA)** with:

✅ **Installation on home screen** - Works on Android, iOS (16.1+), Windows, and macOS  
✅ **Push notifications** - Real-time alerts when team members update projects  
✅ **Loading animations** - Beautiful skeleton screens while data loads  
✅ **Logo branding** - Custom green + blue gradient logo with animated spinner  
✅ **Offline assets** - Service Worker caches UI assets (projects data syncs via network)  
✅ **Web Push API** - Industry-standard push notifications using VAPID keys  

---

## 📋 Files Added/Modified

### New Files Created
```
public/
  ├── logo.svg (base logo)
  ├── logo-dark.svg (dark variant)
  ├── logo-192x192.png (PWA icon)
  ├── logo-512x512.png (splash screen)
  ├── apple-touch-icon.png (iOS home screen)
  ├── favicon-32x32.png (browser tab)
  ├── manifest.json (PWA metadata)
  └── sw.js (service worker)

app/
  ├── projects/loading.tsx (skeleton loader)
  ├── api/notifications/
  │   ├── subscribe/route.ts
  │   └── send/route.ts

components/
  ├── LoadingSpinner.tsx
  ├── ProjectCardSkeleton.tsx
  └── NotificationPrompt.tsx

lib/
  └── service-worker-register.ts

scripts/
  └── generate-icons.js
```

### Modified Files
- `app/layout.tsx` - Added PWA metadata (manifest, icons, theme-color)
- `app/projects/page.tsx` - Added service worker register + notification listener
- `app/api/projects/[id]/route.ts` - Added push notification trigger on update
- `lib/db.ts` - Added `push_subscriptions` table + CRUD functions
- `next.config.ts` - Added PWA config (cache headers for sw.js)
- `package.json` - Added `web-push` dependency + icon generation script

---

## 🔑 Environment Variables

### Local Development (`.env.local`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-min-32-chars
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJe-ySGm...  # Public key - safe to expose
VAPID_PRIVATE_KEY=mjb7v_xZP...            # PRIVATE - never commit!
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

### Vercel Production
1. Go to **Settings → Environment Variables**
2. Add the same 4 variables (don't commit to git)
3. Note: `NEXT_PUBLIC_*` variables are baked into the bundle (safe to expose)

---

## 🛠 Setup Instructions

### 1. Generate VAPID Keys (One-time)
```bash
npx web-push generate-vapid-keys
```
Copy the keys to `.env.local` (already done, see PWA_SETUP.md)

### 2. Local Development
```bash
npm install
npm run dev
```
Visit `http://localhost:3000`

### 3. First-Time Database Migration
After deploying to Vercel:
```bash
curl -X POST https://your-vercel-url.vercel.app/api/setup
```
This creates the `push_subscriptions` table.

### 4. Test PWA Installation
**Chrome/Edge:**
- Open DevTools (F12) → **Application** tab
- Check "Service Workers" registered
- Click **Install** button (top-right address bar)

**Android (Real Device):**
- Open in Chrome
- Tap menu → **Install app**
- Appears on home screen

**iOS (Real Device):**
- Open in Safari
- Tap **Share** → **Add to Home Screen**
- Works on iOS 16.1+ with limited notification support

---

## 📬 Push Notifications

### How They Work
1. User lands on `/projects` page
2. Browser asks: "Allow notifications?" → User clicks **Enable**
3. Browser subscribes to push notifications
4. Subscription sent to `/api/notifications/subscribe`
5. Saved in DB with user ID

### Triggering Notifications
When someone updates a project:
```bash
# Backend automatically sends push via /api/notifications/send
# Triggered by: PUT /api/projects/[id]

curl -X POST https://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "action": "updated",
    "projectName": "My Project",
    "changedBy": "Admin"
  }'
```

### Browser Behavior
- **Desktop**: OS notification popup (Windows 10/11, macOS, Linux)
- **Android**: Appears in notification tray
- **iOS**: Limited (shows only if app in foreground) - Safari limitation

---

## 🎨 Design Details

### Logo & Branding
- **Colors**: Green (`#8DC63F`) + Blue (`#00B4EF`)
- **Animation**: Spinning gradient on loading
- **Sizes**: 192x192 (home screen), 512x512 (splash screen)
- **Formats**: SVG (scalable) + PNG (compatibility)

### Loading States
- **Skeleton cards** appear while projects fetch
- **Shimmer animation** on each card
- **Loading spinner** with animated logo
- **Toast notifications** for updates (bottom-right, auto-dismisses)

### Color Scheme
```css
Primary: #00B4EF (Cyan) - buttons, active states
Secondary: #8DC63F (Green) - success, completed
Dark BG: #080D1A (Navy) - main background
Surface: #111827 - cards, inputs
Error: #FF6B6B - danger actions
```

---

## 🔒 Security Notes

- **VAPID keys**: Private key never exposed (server-side only)
- **Push subscriptions**: Tied to user ID (users only receive if subscribed)
- **JWT tokens**: 7-day expiry, httpOnly cookies
- **CORS**: Service Worker isolated from page JS
- **Data**: Notifications contain minimal info (project name, action)

---

## 📊 Checklist: Is It Working?

- [ ] DevTools → Application → Manifest is valid JSON
- [ ] DevTools → Application → Service Workers shows registered
- [ ] Address bar shows "Install app" button
- [ ] Logo visible in Add to Home Screen dialog
- [ ] First page load shows skeleton loaders
- [ ] Notification permission dialog appears
- [ ] Can accept notifications (permission granted)
- [ ] Test with another user: update project → notification appears
- [ ] Notification click navigates to projects page

---

## 🚀 Deployment to Vercel

### Before Deploying
1. Generate new VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Add to Vercel Settings → Environment Variables:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`

### After Deploying
1. Run database migration:
   ```bash
   curl -X POST https://your-app.vercel.app/api/setup
   ```
2. Test PWA on real device
3. Monitor `/api/notifications/send` logs for errors

---

## 🐛 Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify `/public/sw.js` is being served (curl it)
- Clear browser cache and service workers (DevTools → Clear site data)

### Push Notifications Not Sending
- Verify `VAPID_PRIVATE_KEY` in production environment
- Check `/api/notifications/send` returns `{ success: true }`
- Ensure user has subscribed (notification permission = "granted")

### PWA Won't Install
- Check `/public/manifest.json` is valid
- Verify icons exist and are correct format
- Try incognito/private mode (some extensions block PWA)

### Logo Not Showing
- Check `/public/logo-*.png` and `/public/logo.svg` exist
- Run `npm run generate-icons` to regenerate PNG from SVG
- Verify CORS headers allow image loading

---

## 📚 Resources

- [Web.dev - PWA Checklist](https://web.dev/pwa-checklist/)
- [MDN - Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [next-pwa Docs](https://github.com/shadowwalker/next-pwa) (if upgrading)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/draft-thomson-webpush-vapid)

---

## 📞 Support

For issues with PWA:
1. Check browser console (F12)
2. Check DevTools → Application → Service Workers
3. Check `/api/setup` has been run (creates DB tables)
4. Verify `VAPID_PRIVATE_KEY` is set in production

---

**Last Updated**: April 23, 2026  
**Status**: ✅ Production Ready
