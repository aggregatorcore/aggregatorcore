const express = require('express');
const supabase = require('../config/supabase');
const { authMiddleware } = require('../middlewares/auth');
const { validateLoan } = require('../lib/validate');

const router = express.Router();
router.use(authMiddleware);

function handleDbError(res, error) {
  const msg = String(error?.message || error?.error_description || error?.details || error || '');
  const url = process.env.SUPABASE_URL || '(not set)';
  const isRelationError = /relation|does not exist|Could not find|PGRST116|42P01|schema cache/i.test(msg);
  if (isRelationError) {
    return res.status(500).json({
      status: 'error',
      message: `Supabase: ${msg}`,
      supabase_url: url,
    });
  }
  return res.status(500).json({ status: 'error', message: 'Database error' });
}

function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [val];
    }
  }
  return [];
}

function matchesLender(lender, income, city, employment_type, loan_amount) {
  if (lender.min_income != null && income < lender.min_income) return false;
  if (lender.min_loan != null && loan_amount < lender.min_loan) return false;
  if (lender.max_loan != null && loan_amount > lender.max_loan) return false;

  const cities = toArray(lender.supported_cities);
  if (cities.length > 0) {
    const cityLower = (city || '').toLowerCase();
    const found = cities.some((c) => String(c).toLowerCase() === cityLower);
    if (!found) return false;
  }

  const empTypes = toArray(lender.employment_supported);
  if (empTypes.length > 0) {
    const empLower = (employment_type || '').toLowerCase();
    const found = empTypes.some((e) => String(e).toLowerCase() === empLower);
    if (!found) return false;
  }

  return true;
}

router.post('/lite', validateLoan, async (req, res, next) => {
  const { loan_amount, tenure_months } = req.body;
  const loanAmount = Number(loan_amount);

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', req.user.uid)
      .maybeSingle();

    if (userError) return handleDbError(res, userError);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('monthly_income, city, employment_type')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) return handleDbError(res, profileError);
    if (!profile) {
      return res.status(400).json({ status: 'error', message: 'profile_required' });
    }

    const income = profile.monthly_income || 0;
    const city = profile.city || '';
    const employment_type = profile.employment_type || '';

    const { data: lenders, error: lendersError } = await supabase
      .from('lenders')
      .select('*')
      .eq('is_active', true);

    if (lendersError) return handleDbError(res, lendersError);

    const matchedLenders = (lenders || []).filter((l) =>
      matchesLender(l, income, city, employment_type, loanAmount)
    );

    return res.status(200).json({
      status: 'ok',
      matched_lenders: matchedLenders,
      meta: {
        income,
        city,
        employment_type,
        loan_amount: loanAmount,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
