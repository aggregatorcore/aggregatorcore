const express = require('express');
const supabase = require('../config/supabase');
const { authMiddleware } = require('../middlewares/auth');
const { validateProfilePost } = require('../lib/validate');

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

router.get('/', async (req, res, next) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', req.user.uid)
      .maybeSingle();

    if (userError) {
      return handleDbError(res, userError);
    }

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      return handleDbError(res, profileError);
    }

    return res.status(200).json({ status: 'ok', profile: profile || null });
  } catch (err) {
    next(err);
  }
});

router.post('/', validateProfilePost, async (req, res, next) => {
  const { full_name, city, employment_type, monthly_income } = req.body;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', req.user.uid)
      .maybeSingle();

    if (userError) {
      return handleDbError(res, userError);
    }

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const profileData = {
      full_name: full_name.trim(),
      city: city.trim(),
      employment_type,
      monthly_income: Number(monthly_income),
      updated_at: new Date().toISOString(),
    };

    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (selectError) {
      return handleDbError(res, selectError);
    }

    let profile;
    if (existingProfile) {
      const { data: updated, error: updateError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
      if (updateError) return handleDbError(res, updateError);
      profile = updated;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('user_profiles')
        .insert({ ...profileData, user_id: user.id })
        .select()
        .single();
      if (insertError) return handleDbError(res, insertError);
      profile = inserted;
    }

    return res.status(200).json({ status: 'ok', profile });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
