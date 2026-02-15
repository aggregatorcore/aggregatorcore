/**
 * Full E2E: auth -> profile -> seed lenders -> loan apply -> eligibility lite
 * Requires FIREBASE_WEB_API_KEY in .env
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { getAdmin } = require('../src/config/firebaseAdmin');
const { execSync } = require('child_process');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

function printRelationError(data) {
  const msg = data?.message || '';
  const hasRelationError = data?.supabase_url || /relation|does not exist|Could not find the table/i.test(msg);
  if (hasRelationError) {
    console.error('\n--- Supabase relation error ---');
    console.error('Message:', msg || data);
    console.error('Supabase URL:', data?.supabase_url || process.env.SUPABASE_URL || '(not set)');
    console.error('--------------------------------\n');
  }
}

async function run() {
  const admin = getAdmin();
  if (!admin) {
    console.error('Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH.');
    process.exit(1);
  }

  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) {
    console.error('Set FIREBASE_WEB_API_KEY in .env');
    process.exit(1);
  }

  const ts = Date.now();
  const uid = 'test-uid-' + ts;
  const phone = '+1555' + String(ts).slice(-7);

  const customToken = await admin.auth().createCustomToken(uid, { phone_number: phone });

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (data.error) {
    console.error('Firebase signIn failed:', data.error.message);
    process.exit(1);
  }
  const idToken = data.idToken;
  const authHeader = { Authorization: `Bearer ${idToken}` };

  console.log('1. POST /api/auth/login');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200 || loginData.status !== 'ok') {
    printRelationError(loginData);
    console.error('✗ Auth login failed');
    process.exit(1);
  }
  console.log('   OK');

  console.log('2. POST /api/profile');
  const postProfileRes = await fetch(`${BASE_URL}/api/profile`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Test User',
      city: 'Delhi',
      employment_type: 'salaried',
      monthly_income: 50000,
    }),
  });
  const postProfileData = await postProfileRes.json();
  if (postProfileRes.status !== 200 || postProfileData.status !== 'ok') {
    printRelationError(postProfileData);
    console.error('✗ POST /api/profile failed');
    process.exit(1);
  }
  console.log('   OK');

  console.log('3. Seed lenders');
  try {
    const out = execSync('node scripts/seed-lenders.js', {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
    });
    if (out) console.log('   ', out.trim());
  } catch (e) {
    console.log('   (seed skipped or failed, continuing)');
  }
  console.log('   OK');

  console.log('4. POST /api/loan/apply');
  const loanRes = await fetch(`${BASE_URL}/api/loan/apply`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ loan_amount: 100000, tenure_months: 12 }),
  });
  const loanData = await loanRes.json();
  if (loanRes.status !== 200 || loanData.status !== 'ok') {
    printRelationError(loanData);
    console.error('✗ POST /api/loan/apply failed:', loanData);
    process.exit(1);
  }
  if (!loanData.loan_application) {
    console.error('✗ No loan_application in response');
    process.exit(1);
  }
  console.log('   OK', loanData.loan_application.id);

  console.log('5. POST /api/eligibility/lite');
  const eligRes = await fetch(`${BASE_URL}/api/eligibility/lite`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ loan_amount: 100000, tenure_months: 12 }),
  });
  const eligData = await eligRes.json();
  if (eligRes.status !== 200 || eligData.status !== 'ok') {
    printRelationError(eligData);
    console.error('✗ POST /api/eligibility/lite failed:', eligData);
    process.exit(1);
  }
  console.log('   OK', 'matched_lenders:', eligData.matched_lenders?.length ?? 0, 'meta:', eligData.meta);

  const firstLender = eligData.matched_lenders?.[0];
  if (!firstLender) {
    console.error('✗ No matched lenders for track/click test');
    process.exit(1);
  }

  console.log('6. POST /api/track/click (first matched lender)');
  const trackRes = await fetch(`${BASE_URL}/api/track/click`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ lender_id: firstLender.id }),
  });
  const trackData = await trackRes.json();
  if (trackRes.status !== 200 || trackData.status !== 'ok') {
    printRelationError(trackData);
    console.error('✗ POST /api/track/click failed:', trackData);
    process.exit(1);
  }
  if (!trackData.click?.id || !trackData.click?.utm_code) {
    console.error('✗ Click row not created properly:', trackData);
    process.exit(1);
  }
  const hasUtm = /utm_source=app|utm_medium=affiliate|utm_code=/.test(trackData.redirect_url || '');
  if (!hasUtm) {
    console.error('✗ redirect_url missing UTM params:', trackData.redirect_url);
    process.exit(1);
  }
  console.log('   OK', 'click:', trackData.click.id, 'redirect_url has UTM:', hasUtm);

  console.log('\n✓ Full E2E test passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
