const { z } = require('zod');

const authLoginSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

const profilePostSchema = z.object({
  full_name: z.string().min(1, 'full_name is required').transform((s) => s.trim()),
  city: z.string().min(1, 'city is required').transform((s) => s.trim()),
  employment_type: z.enum(['salaried', 'self_employed'], {
    errorMap: () => ({ message: 'employment_type must be "salaried" or "self_employed"' }),
  }),
  monthly_income: z.number().int().positive('monthly_income must be an integer greater than 0'),
});

const loanSchema = z.object({
  loan_amount: z.number().int().positive('loan_amount must be an integer greater than 0'),
  tenure_months: z.number().int().positive('tenure_months must be an integer greater than 0'),
});

const trackClickSchema = z.object({
  lender_id: z.string().uuid('Valid lender_id (UUID) is required'),
  loan_application_id: z.union([z.string().uuid(), z.undefined(), z.null()]).optional(),
});

const adminLoginSchema = z.object({
  password: z.string().min(1, 'password is required'),
});

function validateAuthLogin(req, res, next) {
  try {
    const parsed = authLoginSchema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err.name === 'ZodError') {
      const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
    }
    next(err);
  }
}

function validateProfilePost(req, res, next) {
  try {
    const body = { ...req.body };
    if (typeof body.monthly_income === 'string') body.monthly_income = parseInt(body.monthly_income, 10);
    const parsed = profilePostSchema.parse(body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err.name === 'ZodError') {
      const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
    }
    next(err);
  }
}

function validateLoan(req, res, next) {
  try {
    const body = { ...req.body };
    if (typeof body.loan_amount === 'string') body.loan_amount = parseInt(body.loan_amount, 10);
    if (typeof body.tenure_months === 'string') body.tenure_months = parseInt(body.tenure_months, 10);
    const parsed = loanSchema.parse(body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err.name === 'ZodError') {
      const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
    }
    next(err);
  }
}

function validateTrackClick(req, res, next) {
  try {
    const parsed = trackClickSchema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err.name === 'ZodError') {
      const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
    }
    next(err);
  }
}

function validateAdminLogin(req, res, next) {
  try {
    const parsed = adminLoginSchema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err.name === 'ZodError') {
      const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
    }
    next(err);
  }
}

module.exports = {
  validateAuthLogin,
  validateProfilePost,
  validateLoan,
  validateTrackClick,
  validateAdminLogin,
};
