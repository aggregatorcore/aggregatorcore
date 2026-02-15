require('./config/env');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const supabase = require('./config/supabase');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');
const { requestLogger } = require('./middlewares/requestLogger');
const logger = require('./lib/logger');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Required for cookies/sessions behind Render's reverse proxy
app.set('trust proxy', 1);

let corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];
// Production fallback: allow Render admin if CORS_ORIGINS not configured
if (isProduction && (!process.env.CORS_ORIGINS || process.env.CORS_ORIGINS.trim() === '')) {
  corsOrigins = ['https://aggregatorcore-1.onrender.com'];
}

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(compression());
app.use(express.json());

// Session store: Postgres when DATABASE_URL set, else memory
// Set SESSION_STORE=memory to force memory store (sessions lost on restart, but works)
let sessionStore;
if (process.env.SESSION_STORE === 'memory' || !process.env.DATABASE_URL) {
  logger.info('Session store: memory');
} else {
  try {
    const pgSession = require('connect-pg-simple')(session);
    const { Pool } = require('pg');
    const dbUrl = process.env.DATABASE_URL;
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes('supabase.co') ? { rejectUnauthorized: false } : false,
    });
    sessionStore = new pgSession({ pool, createTableIfMissing: true });
    logger.info('Session store: PostgreSQL');
  } catch (err) {
    logger.warn({ err: err.message }, 'Postgres session store init failed, using memory');
    sessionStore = undefined;
  }
}

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'admin.sid',
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(requestLogger);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 300 : 1000,
  skip: (req) => !isProduction && req.path.startsWith('/admin'),
  message: { status: 'error', message: 'Too many requests' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: 'error', message: 'Too many requests' },
});
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  skip: () => !isProduction,
  message: { status: 'error', message: 'Too many requests' },
});

app.use('/api/auth', authLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api', globalLimiter);

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Loan Aggregator Backend Running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

app.get('/api/version', (req, res) => {
  const pkg = require('../package.json');
  res.json({
    version: pkg.version,
    commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || null,
  });
});

app.get('/api/db-health', async (req, res, next) => {
  try {
    const { error } = await supabase.from('_health_check').select('*').limit(1);
    if (error) {
      const isTableMissing = /relation|does not exist|Could not find|PGRST116|42P01|schema cache/i.test(error.message);
      if (isTableMissing) {
        return res.json({ status: 'ok', database: 'connected' });
      }
      throw error;
    }
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

module.exports = app;
