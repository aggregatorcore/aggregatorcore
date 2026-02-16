# Render Redis Setup + Session Persistence Verification

## 1. Create Redis on Render

1. **Render Dashboard** → **New** → **Redis**
2. **Name:** `aggregatorcore-redis`
3. **Region:** Same as your backend (e.g. Oregon)
4. **Create**
5. Copy **Internal Redis URL** (e.g. `redis://red-xxx:6379`)

## 2. Add Env Vars in Backend (Render Web Service)

**Render** → **aggregatorcore** (backend) → **Environment**:

| Key | Value |
|-----|-------|
| `REDIS_URL` | (paste Internal Redis URL from step 1) |
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | (strong random string) |
| `CORS_ORIGINS` | `https://aggregatorcore-1.onrender.com` |

**Save** → **Manual Deploy** (or wait for auto-deploy)

## 3. Verify (Browser Test)

1. Open admin: https://aggregatorcore-1.onrender.com
2. **Login** with admin password
3. **Refresh** page → should stay logged in ✓
4. **Wait 5–10 min** (or trigger backend restart from Render)
5. Open admin again → should **still be logged in** ✓

If session persists after restart → Redis is working.

## 4. Quick Test Endpoint

`GET /api/admin/session` already exists:
- **200** = logged in (session valid)
- **401** = not logged in

Test from browser console (while on admin page):
```js
fetch('https://aggregatorcore.onrender.com/api/admin/session', { credentials: 'include' }).then(r => console.log(r.status))
```

## 5. iOS Safari Fix (Proxy)

Admin uses an API proxy (`/api/*` → backend) so requests are same-origin. Safari blocks cross-site cookies; the proxy makes cookies first-party. Set `NEXT_PUBLIC_USE_PROXY=true` in admin env (already in render.yaml).

## 6. Current Config (Confirmed)

| Setting | Value |
|---------|-------|
| Cookie `httpOnly` | ✓ true |
| Cookie `secure` (prod) | ✓ true |
| Cookie `sameSite` (prod) | `none` (required for cross-origin admin) |
| Session store | Redis when `REDIS_URL` set |

---

## Final Report Template

Fill and send:

```
REDIS_CONNECTED: Yes/No
SESSION_PERSISTS_AFTER_REFRESH: Yes/No
SESSION_PERSISTS_AFTER_RESTART: Yes/No
ADMIN_DOMAIN_USED: https://aggregatorcore-1.onrender.com
CORS_ORIGINS_SET: Yes/No
COOKIE_SAMESITE_IN_PROD: none ✓
```
