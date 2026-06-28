# CivicConnect — Smart Public Issues Reporting System

A full-stack civic issue reporting platform: citizens report problems
(roads, water, electricity, garbage, etc.) with photos/video and GPS
location; reports are routed to departments and tracked through
resolution. Built as a premium SaaS-style React frontend with a real
Node/Express + SQLite backend behind it.

```
civicconnect/
├── frontend/   React 19 + Vite + Tailwind v4 + Framer Motion
└── backend/    Node + Express + SQLite (better-sqlite3)
```

## 1. Run the backend

Requires **Node.js 22.13+** (you're already on a newer version if you hit
the previous `better-sqlite3` native-build error — this version uses
Node's own built-in SQLite, so there's nothing to compile).

```bash
cd backend
npm install
cp .env.example .env       # edit JWT_SECRET to something random
npm run dev                # starts on http://localhost:5000
```

The SQLite database file (`civicconnect.db`) is created automatically
on first run — no separate database server, no native build step, no
Visual Studio Build Tools needed on Windows. Uploaded photos/videos are
saved to `backend/uploads/` and served at `/uploads/<filename>`.

You'll see one harmless line in the terminal:
`ExperimentalWarning: SQLite is an experimental feature` — that's Node
itself, not a bug; the built-in module is stable enough for this project
and ships with zero dependencies to compile.

In development, OTP codes and password-reset links are printed to the
backend's terminal instead of being emailed (see `backend/utils/notify.js`).
Watch that terminal when testing registration or "forgot password".

## 2. Run the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`
(see `frontend/vite.config.js`), so the two apps talk to each other with
no extra configuration. Open http://localhost:5173.

## 3. Try the full flow

1. Go to **Register**, fill the form, submit.
2. Check the **backend terminal** for the printed OTP code.
3. Enter that code on the **Verify OTP** screen — you're logged in and
   redirected to the dashboard.
4. Click **Report Issue**, fill in a title/category/description, optionally
   attach a photo and click "Use my current location," then submit.
   You'll get a reference number like `CC-10234`.
5. Go to **Track Complaint** and search that reference number to see its
   live status and progress timeline.

## Connecting your own services

- **Hero videos**: drop 4 short clips into `frontend/public/videos/` — see
  the README there for exact filenames.
- **Real email/SMS for OTP**: replace the function bodies in
  `backend/utils/notify.js` with a provider like Twilio or SendGrid.
- **Real maps**: swap the placeholder grid in
  `frontend/src/components/report/LocationPicker.jsx` for a Google Maps or
  Mapbox embed once you have an API key.
- **Real AI categorization**: replace the simulated timeout in
  `frontend/src/pages/ReportIssuePage.jsx` (`useEffect` that sets
  `prediction`) with a call to your classification endpoint.
- **Admin status updates**: `PATCH /api/issues/:referenceId/status` already
  exists on the backend; build an internal screen (or use a tool like
  Postman) to move issues through pending → in-progress → resolved.

## Tech stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, React Router
  DOM, Lucide React icons, Axios
- **Backend**: Express, better-sqlite3, bcryptjs (password hashing),
  jsonwebtoken (sessions), multer (file uploads), nanoid (IDs)
