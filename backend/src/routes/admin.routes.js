const express = require('express');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
const { adminAuthMiddleware } = require('../middlewares/adminAuth');
const { validateAdminLogin } = require('../lib/validate');

const router = express.Router();

// --- Public routes (no session required) ---

router.post('/login', validateAdminLogin, async (req, res, next) => {
  try {
    const { password } = req.body;
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return res.status(500).json({ status: 'error', message: 'Admin not configured' });
    }
    const isHash = expected.startsWith('$2');
    const valid = isHash ? await bcrypt.compare(password, expected) : password === expected;
    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Invalid password' });
    }
    req.session.admin = true;
    return res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('admin.sid');
    return res.json({ status: 'ok' });
  });
});

router.get('/session', (req, res) => {
  if (req.session?.admin === true) {
    return res.json({ status: 'ok' });
  }
  return res.status(401).json({ status: 'error', message: 'Unauthorized' });
});

// --- Protected routes (require session) ---
router.use(adminAuthMiddleware);

function handleDbError(res, error) {
  const msg = String(error?.message || error?.error_description || error?.details || error || '');
  const isRelationError = /relation|does not exist|Could not find|PGRST116|42P01|schema cache/i.test(msg);
  if (isRelationError) {
    return res.status(500).json({
      status: 'error',
      message: `Supabase: ${msg}`,
      supabase_url: process.env.SUPABASE_URL || '(not set)',
    });
  }
  return res.status(500).json({ status: 'error', message: 'Database error' });
}

router.get('/lenders', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('lenders').select('*').order('created_at', { ascending: false });
    if (error) return handleDbError(res, error);
    return res.json(data || []);
  } catch (err) {
    next(err);
  }
});

router.post('/lenders', async (req, res, next) => {
  const { name, is_active, min_income, min_loan, max_loan, supported_cities, employment_supported, affiliate_url } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'name is required' });
  }
  try {
    const payload = {
      name: name.trim(),
      is_active: is_active !== false,
      min_income: min_income != null ? Number(min_income) : null,
      min_loan: min_loan != null ? Number(min_loan) : null,
      max_loan: max_loan != null ? Number(max_loan) : null,
      supported_cities: supported_cities || null,
      employment_supported: employment_supported || null,
      affiliate_url: affiliate_url || null,
    };
    const { data, error } = await supabase.from('lenders').insert(payload).select().single();
    if (error) return handleDbError(res, error);
    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/lenders/:id', async (req, res, next) => {
  const { id } = req.params;
  const { name, is_active, min_income, min_loan, max_loan, supported_cities, employment_supported, affiliate_url } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'name is required' });
  }
  try {
    const payload = {
      name: name.trim(),
      is_active: is_active !== false,
      min_income: min_income != null ? Number(min_income) : null,
      min_loan: min_loan != null ? Number(min_loan) : null,
      max_loan: max_loan != null ? Number(max_loan) : null,
      supported_cities: supported_cities || null,
      employment_supported: employment_supported || null,
      affiliate_url: affiliate_url || null,
    };
    const { data, error } = await supabase.from('lenders').update(payload).eq('id', id).select().single();
    if (error) return handleDbError(res, error);
    if (!data) return res.status(404).json({ status: 'error', message: 'Lender not found' });
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/lenders/:id/toggle', async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data: current, error: fetchError } = await supabase.from('lenders').select('is_active').eq('id', id).single();
    if (fetchError || !current) return res.status(404).json({ status: 'error', message: 'Lender not found' });
    const newActive = !current.is_active;
    const { data, error } = await supabase.from('lenders').update({ is_active: newActive }).eq('id', id).select().single();
    if (error) return handleDbError(res, error);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/clicks', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('click_tracking')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return handleDbError(res, error);
    return res.json(data || []);
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, firebase_uid, mobile_number, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return handleDbError(res, error);
    return res.json(data || []);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
