const rateLimit = require('express-rate-limit');
const { getMessage } = require('../errors/messages');
const getLocale = require('../utils/locale');

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15min
  max: parseInt(process.env.RESET_LIMIT_MAX),
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const locale = getLocale(req);
    res.status(429).json({
      error: getMessage('auth/too_many_requests', locale),
    });
  },
});

module.exports = resetLimiter;