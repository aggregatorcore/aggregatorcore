/**
 * End-to-end test for POST /api/auth/login + GET/POST /api/profile
 * Requires FIREBASE_WEB_API_KEY in .env (from Firebase Console > Project Settings > General)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { getAdmin } = require('../src/config/firebaseAdmin');

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
    console.error('Set FIREBASE_WEB_API_KEY in .env (Firebase Console > Project Settings > General)');
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

  console.log('1. POST /api/auth/login');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const loginData = await loginRes.json();
  console.log('   Status:', loginRes.status, 'Response:', JSON.stringify(loginData, null, 2));

  if (loginRes.status !== 200 || loginData.status !== 'ok') {
    printRelationError(loginData);
    if (loginData?.message) console.error('Error:', loginData.message);
    console.error('\n✗ Auth login failed');
    process.exit(1);
  }

  const authHeader = { Authorization: `Bearer ${idToken}` };

  console.log('\n2. POST /api/profile');
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
  console.log('   Status:', postProfileRes.status, 'Response:', JSON.stringify(postProfileData, null, 2));

  if (postProfileRes.status !== 200 || postProfileData.status !== 'ok') {
    printRelationError(postProfileData);
    console.error('\n✗ POST /api/profile failed');
    process.exit(1);
  }

  if (!postProfileData.profile) {
    console.error('\n✗ POST /api/profile did not return profile row');
    process.exit(1);
  }

  console.log('\n3. GET /api/profile');
  const getProfileRes = await fetch(`${BASE_URL}/api/profile`, {
    headers: authHeader,
  });
  const getProfileData = await getProfileRes.json();
  console.log('   Status:', getProfileRes.status, 'Response:', JSON.stringify(getProfileData, null, 2));

  if (getProfileRes.status !== 200 || getProfileData.status !== 'ok') {
    printRelationError(getProfileData);
    console.error('\n✗ GET /api/profile failed');
    process.exit(1);
  }

  const postProfile = postProfileData.profile;
  const getProfile = getProfileData.profile;

  if (
    !getProfile ||
    getProfile.full_name !== postProfile.full_name ||
    getProfile.city !== postProfile.city ||
    getProfile.monthly_income !== postProfile.monthly_income
  ) {
    console.error('\n✗ GET profile does not match POST profile');
    console.error('POST:', postProfile);
    console.error('GET:', getProfile);
    process.exit(1);
  }

  console.log('\n✓ E2E test passed (auth + profile)');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
