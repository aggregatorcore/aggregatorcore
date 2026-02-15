const express = require('express');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const loanRoutes = require('./loan.routes');
const eligibilityRoutes = require('./eligibility.routes');
const trackRoutes = require('./track.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/loan', loanRoutes);
router.use('/eligibility', eligibilityRoutes);
router.use('/track', trackRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
