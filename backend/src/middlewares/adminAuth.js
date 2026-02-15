function adminAuthMiddleware(req, res, next) {
  if (req.session?.admin === true) {
    return next();
  }
  return res.status(401).json({ status: 'error', message: 'Unauthorized' });
}

module.exports = { adminAuthMiddleware };
