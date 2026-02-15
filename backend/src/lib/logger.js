const pino = require('pino');
const { isTest } = require('../config/env');

const logger = pino({
  level: isTest ? 'silent' : process.env.LOG_LEVEL || 'info',
});

module.exports = logger;
