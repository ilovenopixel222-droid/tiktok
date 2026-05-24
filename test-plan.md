# ClipViral E2E Test Plan

## What Changed
Full build of an AI SaaS platform with: landing page, auth pages, creator dashboard (7 pages), API routes, database schema. All frontend with mock data, glassmorphism dark UI, Framer Motion animations.

## Primary Flow: Navigate all pages and verify rendering + interactivity

### Test 1: Landing Page renders all sections
- Navigate to `http://localhost:3000`
- **Assert**: Page title contains "ClipViral"
- **Assert**: Hero section visible with "Turn Your Content Into Viral Clips" heading text
- **Assert**: Stats visible showing "2.4M+", "50K+", "8.7B+"
- Scroll down through all sections
- **Assert**: Features section has 16 feature cards visible
- **Assert**: Pricing section shows 3 tiers: "Starter" (Free), "Pro" ($29/mo), "Enterprise" ($99/mo)
- **Assert**: FAQ section has clickable accordion items that expand/collapse

### Test 2: Auth pages render correctly
- Navigate to `/login`
- **Assert**: Login form visible with email and password fields, "Sign In" button
- **Assert**: Google and GitHub OAuth buttons visible
- Navigate to `/signup`
- **Assert**: Signup form visible with name, email, password fields, "Create Account" button
- Navigate to `/forgot-password`
- **Assert**: Email input and "Send Reset Link" button visible

### Test 3: Dashboard home page
- Navigate to `/dashboard`
- **Assert**: Sidebar visible with 8 navigation items (Dashboard, Upload/Paste, My Clips, Video Library, Analytics, Content Calendar, Automation, Settings)
- **Assert**: 4 stat cards visible (Total Clips, Total Views, Viral Score Avg, This Month)
- **Assert**: Recent clips section shows clip titles with viral score badges

### Test 4: Upload page — mode toggle and moment selection
- Navigate to `/dashboard/upload`
- **Assert**: Default mode is "Paste Link" with URL input visible
- Click "Upload File" mode toggle
- **Assert**: File upload dropzone appears instead of URL input
- Click "Paste Link" to switch back
- **Assert**: URL input reappears
- **Assert**: 16 moment type buttons visible (Funny Moments, Emotional Reactions, etc.)
- **Assert**: First 8 moments pre-selected (different visual style from unselected)

### Test 5: Clips page — view mode toggle and status filter
- Navigate to `/dashboard/clips`
- **Assert**: Default view is grid mode with clip cards showing gradient thumbnails
- **Assert**: 9 clips visible by default (filter = "all")
- Click list view icon
- **Assert**: View switches to compact row layout
- Click "published" filter button
- **Assert**: Only clips with "Published" badge shown (should be 5 clips)
- Click "all" to reset

### Test 6: Other dashboard pages render without errors
- Navigate to `/dashboard/library`
- **Assert**: Storage overview cards visible, video list rendered
- Navigate to `/dashboard/analytics`
- **Assert**: Views chart with day-of-week bars rendered, platform breakdown cards visible
- Navigate to `/dashboard/calendar`
- **Assert**: Monthly calendar grid rendered with day numbers, upcoming posts sidebar visible
- Navigate to `/dashboard/automation`
- **Assert**: Connected social accounts section and automation rules visible
- Navigate to `/dashboard/settings`
- **Assert**: Settings tabs visible (Profile, Billing, Notifications, etc.)
- Click "Billing" tab
- **Assert**: Pro Plan info and payment method visible
- Click "Security" tab
- **Assert**: Change password form and 2FA section visible
