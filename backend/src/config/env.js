require('dotenv').config();

const required = [
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_PASSWORD',
  'SESSION_SECRET',
];

const missing = required.filter((key) => !process.env[key] || String(process.env[key]).trim() === '');

const hasFirebaseJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON && String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON).trim() !== '';
const hasFirebasePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH && String(process.env.FIREBASE_SERVICE_ACCOUNT_PATH).trim() !== '';
if (!hasFirebaseJson && !hasFirebasePath) {
  missing.push('FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH');
}

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error('\nSet them in .env or environment. See .env.example');
  process.exit(1);
}

module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
