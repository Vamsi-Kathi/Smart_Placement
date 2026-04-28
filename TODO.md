# Comprehensive Fix Plan

## Issues to Fix
- [x] **Crash on Save** - `TypeError: Cannot read properties of undefined (reading 'Easy')`
- [x] **Signup data not showing** - AuthModal saves wrong profile structure
- [x] **Hardcoded TopBar** - App.jsx shows fake names/initials
- [x] **Admin metrics broken** - Performance never saved to Firestore
- [x] **UI alignment** - Grid layouts break on different screens
- [x] **Database seeding** - Need seed script for demo data

## Files Edited
1. `src/components/Student/Dashboard.jsx` - Fixed crash (safe level fallback), preserved performance on save, removed inline grid styles for CSS-controlled responsiveness
2. `src/components/Public/AuthModal.jsx` - Added separate `course` and `mobile` fields, fixed Firestore save structure
3. `src/App.jsx` - TopBar now fetches real user profile from Firestore, computes initials dynamically
4. `src/components/Admin/Dashboard.jsx` - Computes student performance on-the-fly using codingProgress + problem difficulty weights
5. `src/App.css` - Added `.dash-grid-*` classes with desktop + tablet + mobile breakpoints
6. `scripts/seedMaster.js` - Created master seed script with demo users, coding problems, aptitude questions, and job postings

## Progress
- [x] Step 1: Fix Student Dashboard (crash + UI)
- [x] Step 2: Fix AuthModal (signup structure)
- [x] Step 3: Fix App.jsx (TopBar hardcoded values)
- [x] Step 4: Fix Admin Dashboard (metrics)
- [x] Step 5: Fix App.css (responsive grids)
- [x] Step 6: Create seedMaster.js

## How to Run Seed Script
```bash
node scripts/seedMaster.js
```
Requires `.env.local` with `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`.
