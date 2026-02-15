const express = require('express');
const supabase = require('../config/supabase');
const { getAdmin } = require('../config/firebaseAdmin');
const { validateAuthLogin } = require('../lib/validate');

const router = express.Router();

router.post('/login', validateAuthLogin, async (req, res, next) => {
  const { idToken } = req.body;

  const admin = getAdmin();
  if (!admin) {
    return res.status(500).json({ status: 'error', message: 'Firebase not configured' });
  }

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }

  const uid = decodedToken.uid;
  const phone = decodedToken.phone_number || decodedToken.firebase?.identities?.phone?.[0];

  if (!phone) {
    return res.status(400).json({ status: 'error', message: 'phone_number missing in token' });
  }

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

  try {
    const { data: existing, error: selectError } = await supabase
      .from('users')
      .select('id, firebase_uid, mobile_number')
      .eq('firebase_uid', uid)
      .limit(1)
      .maybeSingle();

    if (selectError) {
      const errMsg = String(selectError?.message || selectError?.error_description || selectError?.details || JSON.stringify(selectError));
      if (/relation|does not exist|Could not find|PGRST116|42P01|schema cache/i.test(errMsg)) {
        return res.status(500).json({
          status: 'error',
          message: `Supabase: ${errMsg}`,
          supabase_url: process.env.SUPABASE_URL || '(not set)',
        });
      }
      return handleDbError(res, selectError);
    }

    if (existing) {
      return res.status(200).json({
        status: 'ok',
        user: {
          id: existing.id,
          firebase_uid: existing.firebase_uid,
          mobile_number: existing.mobile_number || '',
        },
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('users')
      .insert({ firebase_uid: uid, mobile_number: phone })
      .select('id, firebase_uid, mobile_number')
      .single();

    if (insertError) {
      const errMsg = String(insertError?.message || insertError?.error_description || insertError?.details || JSON.stringify(insertError));
      if (/relation|does not exist|Could not find|PGRST116|42P01|schema cache/i.test(errMsg)) {
        return res.status(500).json({
          status: 'error',
          message: `Supabase: ${errMsg}`,
          supabase_url: process.env.SUPABASE_URL || '(not set)',
        });
      }
      return handleDbError(res, insertError);
    }

    return res.status(200).json({
      status: 'ok',
      user: {
        id: inserted.id,
        firebase_uid: inserted.firebase_uid,
        mobile_number: inserted.mobile_number || '',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
