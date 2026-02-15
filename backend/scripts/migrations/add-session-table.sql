-- Session table for connect-pg-simple (admin auth)
-- Run in Supabase SQL Editor if not using createTableIfMissing
-- Or set DATABASE_URL and the app will create it automatically
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
