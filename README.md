# MetPower — Setup Guide

> Smart Manpower Management for Metalliser Industry
> Version: 0.1.0 (Phase 1 — Foundation)

## What's in v0.1

✅ **Phone+OTP Auth** via Firebase Phone Auth
✅ **Roles**: Super Admin / Manager / Team Member
✅ **Manager Registration** with industry-specific fields:
  - Operation Type (Metalliser/Slitter/Both/Vacuum Coating/etc.)
  - Number of Metallisers + Slitters
  - Plant Location
  - Standard fields (Name, Code, Designation)
✅ **Admin Approval Workflow** — pending → approve / reject / suspend / extend
✅ **30-day Free Trial** — auto-expires to paywall
✅ **Admin Dashboard** with company stats + filtering
✅ **Learn & Grow Section** preserved with all 5 iframes:
  - 📚 Met Train PRO
  - 💰 MetCost Pro
  - 📊 MRM Presentation
  - ⏱️ Time Study
  - 🎓 SupSkill
✅ **PWA Installable** + offline support
✅ **Theme Toggle** (Dark/Light)
✅ **Language Toggle** placeholder (full i18n in Phase 5)
✅ **Account Deletion** flow (Play Store compliant)
✅ Privacy Policy + Terms of Service + Account Deletion pages

## Coming in Future Phases

- **Phase 2:** Manager Dashboard + Team Management + Section configuration (free-form)
- **Phase 3:** Shift Schedule + Schedule Builder (port from GLSMP)
- **Phase 4:** Leaves + NCR + To-Do + Reports + WhatsApp notifications
- **Phase 5:** Full i18n + Polish + Play Store assets

---

## Setup Steps

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Add Project → name: **`metpowervks`**
3. Region: **asia-southeast1** (Singapore)
4. Disable Google Analytics for now

### 2. Enable Services

**Authentication:**
- Build → Authentication → Get Started → enable **Phone**
- Add test phone `+918929394920` with code `123456` for development

**Realtime Database:**
- Build → Realtime Database → Create
- Location: **asia-southeast1**
- Mode: Locked (we'll deploy our rules)

### 3. Get Firebase Config

1. Project Settings (⚙️) → General → Your apps
2. Click `</>` Web → register "MetPower Web"
3. Copy `firebaseConfig` values
4. Open `index.html`, find `FIREBASE_CONFIG` (~line 540), replace `REPLACE_ME` placeholders:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_KEY_FROM_FIREBASE",
  authDomain: "metpowervks.firebaseapp.com",
  databaseURL: "https://metpowervks-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "metpowervks",
  storageBucket: "metpowervks.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Deploy Security Rules

Realtime Database → Rules tab → paste contents of `database.rules.json` → Publish

### 5. Authorized Domains

Authentication → Settings → Authorized domains → add:
- `metpower.vkstech.com`
- `localhost` (already added)

### 6. Upload Files

Push to GitHub repo `vkstecho/metpower` (or similar):

```
metpower/
├── index.html
├── sw.js
├── manifest.json
├── database.rules.json
├── privacy.html
├── terms.html
├── delete-account.html
├── README.md
├── icon192.png             ← upload your Gemini icon
├── icon512.png             ← upload your Gemini icon
└── (iframe content files):
    ├── MetalTrain_Pro_v5_Mobile.html
    ├── metcost_pro.html
    ├── mrm_pres.html
    ├── timestudy.html
    └── supskill.html
```

### 7. GitHub Pages + Cloudflare CNAME

- Settings → Pages → main branch → Save
- Cloudflare → DNS → CNAME `metpower` → `vkstecho.github.io`
- Wait for HTTPS provisioning

---

## Test Flow

**As Super Admin (you):**
1. Open `https://metpower.vkstech.com`
2. Phone: `8929394920`
3. OTP: `123456` (test code) or real SMS
4. → Admin Dashboard 👑

**As New Manager (test):**
1. Open in incognito
2. Different 10-digit phone
3. Verify OTP
4. Fill registration form
5. Submit → Pending screen

**Approve as Admin:**
1. Pending tab → click ✅ Approve
2. WhatsApp prompt to notify them
3. Manager logs in → 30-day trial active

---

## Firebase Data Structure

```
metpowervks/
├── users/{phoneKey}/
│   ├── name, phone, role, status
│   ├── companyId, companyName, companyType
│   ├── numMetallisers, numSlitters, plantLocation
│   ├── empCode, designation
│   └── plan, trialStart, trialEnd, requestedAt
│
└── companies/{companyId}/
    ├── info/  (overall company metadata)
    ├── employees/{empId}/    (Phase 2+)
    ├── sections/{sectionId}/ (Phase 2+, free-form)
    ├── schedules/{YYYY_MM}/  (Phase 3+)
    ├── leaves/{leaveId}/     (Phase 4+)
    └── reports/{reportId}/   (Phase 4+)
```

---

## Play Store Publishing (TWA)

When ready:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://metpower.vkstech.com/manifest.json
bubblewrap build
```

Required URLs for Play Console:
- Privacy Policy: `https://metpower.vkstech.com/privacy.html`
- Account Deletion: `https://metpower.vkstech.com/delete-account.html`
- Website: `https://metpower.vkstech.com`

### Data Safety Form Answers

| Data Type | Collected? | Shared? | Purpose |
|---|---|---|---|
| Phone number | Yes | No | Login (OTP) |
| Name | Yes | Within company | App functionality |
| Employee data | Yes | Within company | Core feature |
| Company info | Yes | No | Multi-tenant isolation |
| Location | Plant address only | No | Profile display |
| Photos/contacts/microphone | No | — | — |
| Financial info | No | — | — |

---

## Cost Estimate

For 100 active companies (~5000 employees total):
- Firebase Phone Auth: free (under 10k SMS/month)
- Realtime Database: free tier (1 GB storage, 10 GB/month transfer)
- Hosting: free (GitHub Pages + Cloudflare)
- **Total: ~$0–10/month** until significant scale

---

## Differences from GLSMP

| Feature | GLSMP | MetPower |
|---|---|---|
| Branding | GLS Polyfilms | Generic MetPower |
| Multi-tenant | No (single company) | Yes (multiple companies) |
| Login | Password | Phone OTP |
| Sections | Hardcoded (M1/M2/S1/S2) | Free-form per company |
| Default employees | 27 GLS employees hardcoded | None (each company adds own) |
| Learn & Grow | Yes (kept intact) | Yes (kept intact) |
| Iframes | Yes | Yes (same modules) |

---

Once deployed, share with me and I'll begin **Phase 2** (Manager Dashboard + Team Setup + Sections).
