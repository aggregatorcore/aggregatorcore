const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

function getAdmin() {
  if (admin.apps.length) {
    return admin;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    return admin;
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      let json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (typeof json === 'string' && !json.trim().startsWith('{')) {
        json = Buffer.from(json, 'base64').toString('utf8');
      }
      const serviceAccount = typeof json === 'string' ? JSON.parse(json) : json;
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      return admin;
    } catch (err) {
      return null;
    }
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const credPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      return admin;
    } catch (err) {
      return null;
    }
  }
  return null;
}

module.exports = { getAdmin };
