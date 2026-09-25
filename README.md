# MET Power — Manpower Management System

MET Power metalliser department app (Firebase + PWA-ready).

## Folder structure (upload these to GitHub)

```
met-power/
├── index.html           # App shell (login, header, home, modals)
├── schedule.html        # Schedule tab partial
├── myshift.html         # My Shift tab partial
├── leave.html           # Leave tab partial
├── reports.html         # Reports tab partial
├── todo.html            # To-Do tab partial
├── pending.html         # Pending approvals tab partial
├── team.html            # Team tab partial
├── instructions.html    # Instructions tab partial
├── css/
│   └── app.css          # All styles
├── js/
│   ├── app.js           # Main application logic
│   ├── firebase-init.js # Firebase SDK init
│   └── polyfill.js      # Small browser polyfills
├── .gitignore
└── README.md
```

## How sections work

`index.html` loads the other `*.html` files at runtime via `fetch` and injects them into `#mainContent`.  
Keep all HTML files in the **same folder** (repo root).

## Run locally

```bash
# any static server
python3 -m http.server 8080
# open http://localhost:8080
```

Do **not** open `index.html` as `file://` — section loading will fail.

## Assets you still need to add

Copy from your existing deploy (same names, same folder):

- `manifest.json`
- `sw.js` (service worker)
- `MP-logo.svg`
- `icon-192.png`
- `icon-180.png`
- `vkslogo512.png` (if used)

## Firebase

Config lives in `js/firebase-init.js`.  
Project: `metpowervks` (Asia Southeast RTDB).

## GitHub upload

1. Create a new repo on GitHub (e.g. `met-power`).
2. Upload this entire `met-power` folder contents as the repo root.
3. Enable GitHub Pages (Settings → Pages → Deploy from `main` / root) **or** host on Firebase Hosting / Netlify / Cloudflare Pages.

## Fix notes (2026-09-25) — shift Save PERMISSION_DENIED

Changed files:
- `js/app.js` — restore pending on failed Save; auto `managers/{uid}` / `admins/{uid}`; clearer error UI; GP badge colour; `editShiftCell` uses `canEditSchedule()`
- `css/app.css` — toast contrast (readable on light & dark)
- `database.rules.json` — **yes, rules changed** (see below)
- `FIREBASE_RULES_DEPLOY.md` — deploy steps for this fix

### Firebase rules: YES, you must republish

Upload/publish the new `database.rules.json` in Firebase Console (or CLI).  
Managers can write `overrides` / schedules when they are an **approved manager in `mobileUsers`** (Phone OTP), not only when `/managers/{uid}` exists.

After deploy: managers should **Logout → Login with Phone OTP**, then Save shifts again.
