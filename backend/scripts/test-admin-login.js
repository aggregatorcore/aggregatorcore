/**
 * Quick test for admin session login.
 * Run with backend server running: node scripts/test-admin-login.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const BASE = process.env.API_BASE_URL || 'http://localhost:5000';

async function test() {
  // Login
  const loginRes = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'admin123' }),
  });
  const cookies = loginRes.headers.get('set-cookie');
  const loginBody = await loginRes.text();
  console.log('Login status:', loginRes.status, loginBody);

  if (loginRes.status !== 200) {
    console.error('Login failed');
    process.exit(1);
  }

  if (!cookies) {
    console.log('Warning: No Set-Cookie header');
  } else {
    console.log('Cookie received');
  }

  // Test protected route with cookie
  const sessionCookie = cookies ? cookies.split(';')[0] : '';
  const lendersRes = await fetch(`${BASE}/api/admin/lenders`, {
    headers: { Cookie: sessionCookie },
  });
  console.log('Lenders (with cookie) status:', lendersRes.status);

  if (lendersRes.status !== 200) {
    console.error('Protected route failed without cookie');
    process.exit(1);
  }

  // Test without cookie - should get 401
  const noCookieRes = await fetch(`${BASE}/api/admin/lenders`);
  console.log('Lenders (no cookie) status:', noCookieRes.status);
  if (noCookieRes.status !== 401) {
    console.error('Expected 401 without cookie');
    process.exit(1);
  }

  console.log('✓ Admin session test passed');
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});
