const rateLimit = require('express-rate-limit');
const { getMessage } = require('../errors/messages');
const getLocale = require('../utils/locale');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const locale = getLocale(req);
    res.status(429).json({
      error: getMessage('auth/too_many_requests', locale),
    });
  },
});