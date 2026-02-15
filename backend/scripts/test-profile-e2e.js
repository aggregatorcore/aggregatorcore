/**
 * E2E test for GET/POST /api/profile
 * Requires server running and FIREBASE_WEB_API_KEY in .env
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { getAdmin } = require('../src/config/firebaseAdmin');

async function getTestIdToken() {
  const admin = getAdmin();
  if (!admin) throw new Error('Firebase not configured');
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error('Set FIREBASE_WEB_API_KEY in .env');

  const uid = 'test-uid-' + Date.now();
  const phone = '+15551234567';
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
  if (data.error) throw new Error('Firebase signIn failed: ' + data.error.message);
  return { idToken: data.idToken, uid };
}

async function run() {
  const baseUrl = 'http://localhost:5000';

  console.log('1. Getting idToken...');
  const { idToken } = await getTestIdToken();

  console.log('2. POST /api/auth/login (create user)...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (loginRes.status !== 200) {
    console.error('Login failed:', await loginRes.text());
    process.exit(1);
  }

  console.log('3. GET /api/profile (expect null)...');
  let getRes = await fetch(`${baseUrl}/api/profile`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  let getData = await getRes.json();
  console.log('   Status:', getRes.status, 'Profile:', getData.profile);
  if (getRes.status !== 200) {
    console.error('GET profile failed');
    process.exit(1);
  }

  console.log('4. POST /api/profile...');
  const postRes = await fetch(`${baseUrl}/api/profile`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      full_name: 'Test User',
      city: 'Mumbai',
      employment_type: 'salaried',
      monthly_income: 50000,
    }),
  });
  const postData = await postRes.json();
  console.log('   Status:', postRes.status, 'Profile:', postData.profile);
  if (postRes.status !== 200) {
    console.error('POST profile failed:', postData);
    process.exit(1);
  }

  console.log('5. GET /api/profile (expect saved profile)...');
  getRes = await fetch(`${baseUrl}/api/profile`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  getData = await getRes.json();
  console.log('   Status:', getRes.status, 'Profile:', getData.profile);
  if (getRes.status !== 200 || !getData.profile) {
    console.error('GET profile after POST failed');
    process.exit(1);
  }

  if (
    getData.profile.full_name === 'Test User' &&
    getData.profile.city === 'Mumbai' &&
    getData.profile.monthly_income === 50000
  ) {
    console.log('\n✓ Profile E2E test passed');
  } else {
    console.error('\n✗ Profile data mismatch');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
