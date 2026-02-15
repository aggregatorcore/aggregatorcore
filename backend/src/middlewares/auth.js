const { getAdmin } = require('../config/firebaseAdmin');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Missing or invalid Authorization header' });
  }

  const idToken = authHeader.substring(7).trim();
  if (!idToken) {
    return res.status(401).json({ status: 'error', message: 'Token required' });
  }

  const admin = getAdmin();
  if (!admin) {
    return res.status(500).json({ status: 'error', message: 'Firebase not configured' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phone_number = decodedToken.phone_number || decodedToken.firebase?.identities?.phone?.[0] || null;

    req.user = {
      uid: decodedToken.uid,
      phone_number,
    };
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
