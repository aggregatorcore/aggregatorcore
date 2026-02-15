# Loan Aggregator Admin

Next.js admin panel for the Loan Aggregator backend.

## Setup

1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_API_BASE_URL` to your backend URL (default: http://localhost:5000)
3. Set `ADMIN_PASSWORD` in the backend `.env` (used for login)

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Login with the password from backend `ADMIN_PASSWORD`.

## Pages

- `/login` - Password login (MVP)
- `/lenders` - List, add, edit, toggle active
- `/logs/clicks` - Click tracking table
- `/users` - Users table
