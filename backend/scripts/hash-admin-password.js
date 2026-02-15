/**
 * Generate bcrypt hash for ADMIN_PASSWORD.
 * Run: node scripts/hash-admin-password.js [plain-password]
 * Add the output to .env as ADMIN_PASSWORD=<hash>
 */
const bcrypt = require('bcrypt');
const pwd = process.argv[2] || 'admin123';
bcrypt.hash(pwd, 10).then((hash) => {
  console.log('Add to .env:');
  console.log(`ADMIN_PASSWORD=${hash}`);
});
