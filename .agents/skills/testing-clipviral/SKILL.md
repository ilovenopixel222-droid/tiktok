---
name: testing-clipviral
description: Test the ClipViral SaaS platform end-to-end. Use when verifying UI rendering, navigation, and interactive elements across landing page, auth, and dashboard.
---

# Testing ClipViral

## Prerequisites
- Node.js installed
- `npm install` completed in `/home/ubuntu/repos/clipviral/`
- No external secrets needed for frontend testing (all data is mock/demo)

## Setup
1. Kill any existing process on port 3000: `fuser -k 3000/tcp 2>/dev/null`
2. Start dev server: `cd /home/ubuntu/repos/clipviral && npx next dev --port 3000` (background)
3. Wait for "Ready" message in server output
4. Maximize browser: `sudo apt-get install -y wmctrl 2>/dev/null; wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`

## Navigation Paths
- Landing page: `localhost:3000/`
- Login: `localhost:3000/login`
- Signup: `localhost:3000/signup`
- Forgot password: `localhost:3000/forgot-password`
- Dashboard: `localhost:3000/dashboard`
- Upload: `localhost:3000/dashboard/upload`
- Clips: `localhost:3000/dashboard/clips`
- Library: `localhost:3000/dashboard/library`
- Analytics: `localhost:3000/dashboard/analytics`
- Calendar: `localhost:3000/dashboard/calendar`
- Automation: `localhost:3000/dashboard/automation`
- Settings: `localhost:3000/dashboard/settings`

## Key Interactive Elements
- **Upload page**: Mode toggle between "Paste Link" and "Upload File" (buttons at top)
- **Clips page**: Grid/List view toggle (icons in toolbar), status filter buttons (All, Published, Ready, Processing, Scheduled, Draft)
- **Settings page**: Tab navigation (Profile, Billing, Notifications, Appearance, Security, Team, API Keys)
- **Landing page FAQ**: Accordion items that expand/collapse on click (be careful — the navbar "Log In" link might overlap at the top of the viewport)
- **Sidebar**: Collapse toggle button (chevron icon next to "ClipViral" logo)

## Testing Tips
- Use direct URL navigation (`localhost:3000/dashboard/clips`) rather than clicking sidebar links when speed matters
- The landing page is long — scroll incrementally to verify each section (Hero → Features → How It Works → Pricing → Testimonials → FAQ → CTA → Footer)
- When clicking FAQ items, scroll down enough that the navbar doesn't overlap the FAQ section
- The "Start Clipping Free" CTA on the landing page navigates to `/signup`, and "Sign In" on login navigates to `/dashboard` — this is expected behavior (no real auth)
- All data is mock/demo — no backend services needed
- Build verification: `npm run build` should pass with zero errors; `npm run lint` should pass with zero warnings
- No CI is configured on this repo

## Devin Secrets Needed
None — all testing uses mock data with no external service connections.
