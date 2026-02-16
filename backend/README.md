# Loan Aggregator Backend

Node.js Express backend for the Loan Aggregator app.

📖 **Supabase + Render integration:** See [docs/SUPABASE-RENDER-INTEGRATION.md](../docs/SUPABASE-RENDER-INTEGRATION.md)

## Setup

1. Copy `.env.example` to `.env` and fill in credentials.
2. Place `firebase-service-account.json` in the backend root (or set `FIREBASE_SERVICE_ACCOUNT_PATH`).
3. Run the table migrations in Supabase (see below).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | Yes | Server port (Render sets automatically) |
| NODE_ENV | Yes (prod) | Set to `production` for deployment |
| SUPABASE_URL | Yes | Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Supabase service role key |
| ADMIN_PASSWORD | Yes | Admin web login password (plain or bcrypt hash) |
| SESSION_SECRET | Yes | Secret for session signing (use strong random string) |
| FIREBASE_SERVICE_ACCOUNT_JSON | Yes* | Firebase service account JSON (for cloud deploy) |
| FIREBASE_SERVICE_ACCOUNT_PATH | Yes* | Path to Firebase JSON file (for local) |
| CORS_ORIGINS | Yes (prod) | Comma-separated allowed origins (e.g. admin URL) |
| REDIS_URL | Yes (prod) | Redis connection string for session store |
| FIREBASE_WEB_API_KEY | No | For E2E test script |
| LOG_LEVEL | No | pino log level (default: info) |

*One of FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH is required.

## Running

**Development:**
```bash
npm install
npm run dev
```

**Production:**
```bash
NODE_ENV=production npm start
```

## Deploy to Render

1. **Create Web Service** in [Render Dashboard](https://dashboard.render.com)
2. **Connect** your Git repo (backend folder or monorepo root)
3. **Build & Start:**
   - If **backend is repo root:** Build: `npm install`, Start: `npm start`
   - If **backend in subfolder:** Root Directory: `backend`, Build: `npm install`, Start: `npm start`
4. **Environment Variables** (add in Render Dashboard):

   | Variable | Value |
   |----------|-------|
   | PORT | (auto-set by Render) |
   | NODE_ENV | production |
   | SUPABASE_URL | your Supabase URL |
   | SUPABASE_SERVICE_ROLE_KEY | your Supabase service key |
   | FIREBASE_SERVICE_ACCOUNT_JSON | Paste full JSON or base64-encoded JSON |
   | ADMIN_PASSWORD | bcrypt hash (run `node scripts/hash-admin-password.js <pwd>`) |
   | SESSION_SECRET | Strong random string (e.g. `openssl rand -hex 32`) |
   | CORS_ORIGINS | https://your-admin.onrender.com,https://your-mobile-app.com |
   | REDIS_URL | Redis connection string (see [Redis setup](#redis-setup) below) |

5. **Firebase JSON:** In Render, paste the JSON as a single line (minified) or use base64:
   - Linux/Mac: `cat firebase-service-account.json | base64 -w 0`
   - Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("firebase-service-account.json"))`
   Paste the output into `FIREBASE_SERVICE_ACCOUNT_JSON`.

6. **Deploy** – Render will build and start the server.

## Redis Setup

Sessions are stored in Redis. Without `REDIS_URL`, the app falls back to in-memory storage (sessions lost on restart).

**Options:**

1. **Render Redis** – Add a Redis instance in Render Dashboard, copy its internal URL to `REDIS_URL`.
2. **Upstash** – Create a Redis database at [upstash.com](https://upstash.com), use the REST URL (format: `rediss://default:[password]@[host]:6379`).
3. **Local** – `REDIS_URL=redis://localhost:6379` for development.

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set strong `ADMIN_PASSWORD` (use `node scripts/hash-admin-password.js <pwd>` for hash)
- [ ] Set strong `SESSION_SECRET`
- [ ] Configure `CORS_ORIGINS` for your admin and mobile app origins
- [ ] Set `REDIS_URL` for persistent admin sessions
- [ ] Ensure all Supabase tables exist
- [ ] Use HTTPS (Render provides automatically)

## Required Supabase Tables

**Users table:**

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  mobile_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX users_firebase_uid_key ON public.users (firebase_uid);
```

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  city TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('salaried', 'self_employed')),
  monthly_income INTEGER NOT NULL CHECK (monthly_income > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles (user_id);
```

```sql
CREATE TABLE public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  loan_amount INTEGER NOT NULL CHECK (loan_amount > 0),
  tenure_months INTEGER NOT NULL CHECK (tenure_months > 0),
  status TEXT NOT NULL DEFAULT 'lite_checked',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  min_income INTEGER,
  min_loan INTEGER,
  max_loan INTEGER,
  supported_cities JSONB,
  employment_supported JSONB,
  affiliate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES public.lenders(id) ON DELETE CASCADE,
  utm_code TEXT NOT NULL,
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Manual Test: POST /api/auth/login

### Getting idToken from Flutter / Firebase

**Flutter (Firebase Auth):**

```dart
// After sign-in (e.g. phone, email)
User? user = FirebaseAuth.instance.currentUser;
String? idToken = await user?.getIdToken();
// Send idToken in the request body
```

**Firebase Web (JavaScript):**

```javascript
const user = firebase.auth().currentUser;
const idToken = await user.getIdToken();
// Send idToken in the request body
```

### Calling the endpoint

```bash
# Replace <firebase-id-token> with the actual token from Firebase Auth (phone sign-in)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "<firebase-id-token>"}'
```

**Success (200):**

```json
{
  "status": "ok",
  "user": {
    "id": "uuid",
    "firebase_uid": "firebase-uid",
    "mobile_number": "+1234567890"
  }
}
```

**Errors:** 400 (missing idToken, phone_number missing in token), 401 (invalid token), 500 (DB/Firebase config error)

### Profile endpoints (auth required)

```bash
# GET profile - requires Authorization: Bearer <idToken>
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer <firebase-id-token>"

# POST profile - create/update profile
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer <firebase-id-token>" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","city":"Mumbai","employment_type":"salaried","monthly_income":50000}'
```

### Loan & Eligibility endpoints (auth required)

```bash
# POST /api/loan/apply
curl -X POST http://localhost:5000/api/loan/apply \
  -H "Authorization: Bearer <firebase-id-token>" \
  -H "Content-Type: application/json" \
  -d '{"loan_amount":100000,"tenure_months":12}'

# POST /api/eligibility/lite
curl -X POST http://localhost:5000/api/eligibility/lite \
  -H "Authorization: Bearer <firebase-id-token>" \
  -H "Content-Type: application/json" \
  -d '{"loan_amount":100000,"tenure_months":12}'

# POST /api/track/click
curl -X POST http://localhost:5000/api/track/click \
  -H "Authorization: Bearer <firebase-id-token>" \
  -H "Content-Type: application/json" \
  -d '{"lender_id":"<lender-uuid>","loan_application_id":"<loan-application-uuid>"}'
```

### Seed lenders (optional)

```bash
node scripts/seed-lenders.js
```

### Admin API (session-based auth)

Admin endpoints require a valid session (httpOnly cookie). Login via `POST /api/admin/login`.

- POST /api/admin/login — body: `{ "password": "..." }` — creates session
- POST /api/admin/logout — destroys session
- GET /api/admin/session — returns 200 if logged in, 401 otherwise
- GET /api/admin/lenders
- POST /api/admin/lenders
- PUT /api/admin/lenders/:id
- PATCH /api/admin/lenders/:id/toggle
- GET /api/admin/clicks
- GET /api/admin/users

### Version

- GET /api/version — returns `{ version, commit }` (commit from RENDER_GIT_COMMIT or GIT_COMMIT)

### E2E test scripts (optional)

With `FIREBASE_WEB_API_KEY` in `.env` (from Firebase Console > Project Settings > General):

```bash
node scripts/test-auth-e2e.js       # Auth + profile
node scripts/test-full-e2e.js       # Auth -> profile -> seed -> loan apply -> eligibility lite
```
