# Loan Aggregator Admin

Next.js admin panel for the Loan Aggregator backend.

## Deploy to Render

### Option A: Blueprint (recommended)

1. In [Render Dashboard](https://dashboard.render.com), click **New** → **Blueprint**
2. Connect the same repo: `aggregatorcore/aggregatorcore`
3. Render will detect `render.yaml` and create the admin service
4. After deploy, admin URL: `https://aggregatorcore-admin.onrender.com`
5. **Important:** Add to **backend** env vars: `CORS_ORIGINS` = `https://aggregatorcore-admin.onrender.com`
6. Redeploy backend after adding CORS

### Option B: Manual Web Service

1. **New** → **Web Service**
2. Connect repo, branch: main
3. **Root Directory:** `admin-web`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm start`
6. **Environment:**
   - `NODE_ENV` = production
   - `NEXT_PUBLIC_API_BASE_URL` = https://aggregatorcore.onrender.com
7. **Instance:** Free
8. Deploy

### After Admin Deploy

Update backend `CORS_ORIGINS` to include your admin URL, then redeploy backend.

## Local Development

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000` in `.env.local`.
