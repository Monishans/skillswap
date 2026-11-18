# SkillSwap – Student Skill Exchange Platform

React + Vite frontend (`client/`) and Express REST API (`server/`) with JSON-file storage.
Students list what they can teach and want to learn; SkillSwap finds **mutual** matches.

## Run locally
```bash
# Terminal 1 - API on http://localhost:5000
cd server && npm install && npm start

# Terminal 2 - UI on http://localhost:5173
cd client && npm install && npm run dev
```
No env vars are needed locally (the client falls back to `http://localhost:5000`).

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | health check |
| GET | /api/students | all profiles |
| POST | /api/students | create profile (400 invalid, 409 duplicate email) |
| GET | /api/students/:id | one profile |
| GET | /api/matches/:id | mutual matches for a student |
| GET | /api/stats | totals |

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/students
curl http://localhost:5000/api/matches/s1
curl http://localhost:5000/api/stats
curl -X POST http://localhost:5000/api/students -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","college":"XYZ","teach":"Figma, UI/UX","learn":"React","bio":"hi"}'
# repeat the POST -> 409 duplicate email
```

## Test the matching
Seed data is built so these mutual pairs exist: Aarav (s1) ↔ Priya (s2) · Aarav (s1) ↔ Karthik (s5) · Rohan (s3) ↔ Sneha (s4) · Rohan (s3) ↔ Karthik (s5).
1. Open **My Matches**, pick *Priya Nair* → Aarav appears with a match percentage.
2. Add a profile that teaches `UI/UX` and wants `React` → you auto-land on My Matches with Aarav at the top.
3. Skills are compared lowercase and trimmed, so ` react ` equals `React`.

Match % = distinct skills exchanged ÷ distinct skills both people want to learn (capped at 100).

## Push to GitHub
```bash
cd skillswap
git init && git add . && git commit -m "SkillSwap"
git branch -M main
git remote add origin https://github.com/<you>/skillswap.git
git push -u origin main
```

## Deploy on Render (do the backend first)
### 1. Backend – Web Service
New + → Web Service → connect repo, then:
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Env var `CLIENT_URL` = your frontend URL (add it after step 2; you can put a placeholder first)
- Env var `MONGODB_URI` = your Atlas connection string
- `PORT` is provided by Render automatically; do not set it.

Check `https://<backend>.onrender.com/api/health`.

### 2. Frontend – Static Site
New + → Static Site → same repo, then:
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Env var `VITE_API_URL` = `https://<backend>.onrender.com` (no trailing slash)
- Redirects/Rewrites tab → add: Source `/*`, Destination `/index.html`, Action **Rewrite** (needed so refreshing `/explore` etc. works)

### 3. Connect them
Copy the static site URL into the backend's `CLIENT_URL` (comma-separate for several origins, no trailing slash) and save; the backend redeploys.
`VITE_API_URL` is baked in at build time, so after changing it use **Manual Deploy → Clear build cache & deploy** on the static site.

(Alternative: `render.yaml` in the repo root is a Blueprint for both services.)

## Database: MongoDB Atlas (permanent storage)
Set `MONGODB_URI` and the API stores profiles in MongoDB (database `skillswap`, collection `students`; the 5 seed profiles are inserted automatically when the collection is empty; emails have a unique index). Without `MONGODB_URI` it falls back to `server/data/students.json`, which Render wipes on redeploy.

Atlas setup: create a free M0 cluster -> Database Access: add a user + password -> Network Access: add `0.0.0.0/0` -> Connect -> Drivers -> copy the connection string and replace `<password>`.
Locally: `cp server/.env.example server/.env`, paste the string, `npm start`. On Render: add `MONGODB_URI` to the backend service's Environment tab.

Free-tier Render backends sleep after ~15 min idle; the first request can take ~30-50 s.

## Common errors
- **CORS error in browser**: `CLIENT_URL` doesn't exactly match the frontend origin (https, no trailing slash).
- **"Cannot reach the server"**: `VITE_API_URL` missing/wrong, or you didn't rebuild after changing it.
- **404 on page refresh**: rewrite rule `/*` → `/index.html` is missing.
- **Profiles disappeared**: `MONGODB_URI` isn't set on Render, so the JSON fallback is in use.
- **Storage init failed / 500 errors**: wrong password in the URI, special characters not URL-encoded, or Atlas Network Access doesn't allow `0.0.0.0/0`.

## Production checklist
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] Home page lists sample students and stats
- [ ] Explore search + skill filter work
- [ ] Add Profile validates, saves, rejects duplicate email
- [ ] My Matches shows mutual matches; Connect modal copies email
- [ ] Refreshing `/explore` doesn't 404
- [ ] No CORS errors in the browser console
