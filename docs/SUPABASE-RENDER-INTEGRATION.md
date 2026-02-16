# Supabase + Render Integration Guide

This guide explains how Supabase and Render work together in the Loan Aggregator project.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Admin Web      │────▶│  Backend (API)   │────▶│  Supabase       │
│  (Render)       │     │  (Render)        │     │  (Database)     │
│  aggregatorcore-1│     │  aggregatorcore  │     │  Postgres + API │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                         │
         │                         │
         └─────────────────────────┴──────▶ Redis (sessions)
```

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create project
2. **Project Settings** → **API**:
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
3. **SQL Editor** → Run migrations from `backend/README.md` (users, lenders, etc.)

## 2. Render Setup

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. **New** → **Blueprint** → Connect this repo
3. Render reads `render.yaml` and creates admin service (backend is deployed separately)
5. **Add secrets** in Backend → Environment (not stored in yaml):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (from Supabase)
   - `ADMIN_PASSWORD`, `SESSION_SECRET`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `REDIS_URL`

## 3. Connect Supabase to Render

In **Render Dashboard** → **Backend service** → **Environment**:

| Variable | Where to get it |
|----------|-----------------|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role (secret) |

## 4. Optional: Render Redis (for sessions)

1. Render Dashboard → **New** → **Redis**
2. Create Redis instance
3. Copy **Internal Redis URL**
4. Add to backend env: `REDIS_URL` = that URL

## 5. CORS (Admin ↔ Backend)

Backend needs to allow admin origin. Add to backend env:

```
CORS_ORIGINS=https://aggregatorcore-1.onrender.com
```

## Quick Checklist

- [ ] Supabase project created
- [ ] Supabase tables migrated (users, lenders, etc.)
- [ ] Render backend deployed
- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Render
- [ ] `CORS_ORIGINS` includes admin URL
- [ ] `REDIS_URL` set (or use memory store)
