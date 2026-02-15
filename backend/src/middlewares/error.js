const { isProduction, isTest } = require('../config/env');
const logger = require('../lib/logger');

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (!isTest) {
    logger.error({ err, method: req.method, path: req.path, status }, message);
  }

  const body = {
    status: 'error',
    message: isProduction && status >= 500 ? 'Internal server error' : message,
  };

  if (!isProduction && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}

module.exports = { errorHandler };
