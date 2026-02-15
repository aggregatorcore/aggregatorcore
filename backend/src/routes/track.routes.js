const express = require('express');
const supabase = require('../config/supabase');
const { authMiddleware } = require('../middlewares/auth');
const { buildUtmParams, appendUtmToUrl } = require('../utils/utm');
const { validateTrackClick } = require('../lib/validate');

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

router.post('/click', validateTrackClick, async (req, res, next) => {
  const { lender_id, loan_application_id } = req.body;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', req.user.uid)
      .maybeSingle();

    if (userError) return handleDbError(res, userError);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    const { data: lender, error: lenderError } = await supabase
      .from('lenders')
      .select('id, affiliate_url')
      .eq('id', lender_id)
      .eq('is_active', true)
      .maybeSingle();

    if (lenderError) return handleDbError(res, lenderError);
    if (!lender) return res.status(404).json({ status: 'error', message: 'Lender not found' });

    const utmParams = buildUtmParams({ userId: user.id, lenderId: lender_id });
    const { utm_code, ...utmForUrl } = utmParams;

    const insertPayload = {
      user_id: user.id,
      lender_id: lender_id,
      utm_code,
    };
    if (loan_application_id) insertPayload.loan_application_id = loan_application_id;

    const { data: click, error: insertError } = await supabase
      .from('click_tracking')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) return handleDbError(res, insertError);

    const affiliateUrl = lender.affiliate_url || '';
    const redirect_url = appendUtmToUrl(affiliateUrl, { ...utmForUrl, utm_code });

    const clickedAt = click?.clicked_at || click?.created_at || new Date().toISOString();

    return res.status(200).json({
      status: 'ok',
      click: {
        id: click.id,
        utm_code: click.utm_code,
        clicked_at: clickedAt,
      },
      redirect_url,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
