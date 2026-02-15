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

router.post('/apply', validateLoan, async (req, res, next) => {
  const { loan_amount, tenure_months } = req.body;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', req.user.uid)
      .maybeSingle();

    if (userError) return handleDbError(res, userError);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    const { data: loanApplication, error: insertError } = await supabase
      .from('loan_applications')
      .insert({
        user_id: user.id,
        loan_amount: Number(loan_amount),
        tenure_months: Number(tenure_months),
        status: 'lite_checked',
      })
      .select()
      .single();

    if (insertError) return handleDbError(res, insertError);

    return res.status(200).json({ status: 'ok', loan_application: loanApplication });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
