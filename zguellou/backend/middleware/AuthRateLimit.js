const rateLimit = require('express-rate-limit');
const { getMessage } = require('../errors/messages');
const getLocale = require('../utils/locale');

const GOOGLE_REDIRECT_MAX_ATTEMPTS = parseInt(process.env.GOOGLE_REDIRECT_RATE_LIMIT_MAX) || 30;
const GOOGLE_CALLBACK_MAX_ATTEMPTS = parseInt(process.env.GOOGLE_CALLBACK_RATE_LIMIT_MAX) || 15;
const RESET_LIMIT_MAX_ATTEMPTS = parseInt(process.env.RESET_LIMIT_MAX) || 5;
const REFRESH_RATE_LIMIT_MAX_ATTEMPTS = parseInt(process.env.REFRESH_RATE_LIMIT_MAX) || 60;
const VERIFY_2FA_RATE_LIMIT_MAX_ATTEMPTS = parseInt(process.env.VERIFY_2FA_RATE_LIMIT_MAX) || 5;
const PROFILE_UPDATE_RATE_LIMIT_MAX_ATTEMPTS = parseInt(process.env.PROFILE_UPDATE_RATE_LIMIT_MAX) || 20;
const TOGGLE_2FA_RATE_LIMIT_MAX_ATTEMPTS = parseInt(process.env.TOGGLE_2FA_RATE_LIMIT_MAX) || 10;
const CHANGE_OWN_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS = parseInt(process.env.CHANGE_OWN_PASSWORD_RATE_LIMIT_MAX) || 10;

function handler(req, res) {
  const locale = getLocale(req);
  res.status(429).json({
    error: getMessage('auth/too_many_requests', locale),
  });
}

const loginIpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,       
  keyGenerator: (req) => `ip:${req.ip}`,
  standardHeaders: false,
  legacyHeaders: false,
  handler,
});

const registerIpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const forgotPasswordRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const googleRedirectRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: GOOGLE_REDIRECT_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const googleCallbackRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: GOOGLE_CALLBACK_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15min
  max: RESET_LIMIT_MAX_ATTEMPTS,
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: REFRESH_RATE_LIMIT_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const verify2faRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: VERIFY_2FA_RATE_LIMIT_MAX_ATTEMPTS,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const profileUpdateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: PROFILE_UPDATE_RATE_LIMIT_MAX_ATTEMPTS,
  keyGenerator: (req) => `user:${req.user.id}`,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const toggle2faRateLimit = rateLimit({
  windowMs: parseInt(process.env.TOGGLE_2FA_LOCKOUT_MINUTES) * 60 * 1000,
  max: TOGGLE_2FA_RATE_LIMIT_MAX_ATTEMPTS,
  keyGenerator: (req) => `user:${req.user.id}`,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const changeOwnPasswordRateLimit = rateLimit({
  windowMs: parseInt(process.env.CHANGE_OWN_PASSWORD_LOCKOUT_MINUTES) * 60 * 1000,
  max: CHANGE_OWN_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS,
  keyGenerator: (req) => `user:${req.user.id}`,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

module.exports = {
  loginIpRateLimit,
  registerIpRateLimit,
  forgotPasswordRateLimit,
  googleRedirectRateLimit,
  googleCallbackRateLimit,
  resetLimiter,
  refreshRateLimit,
  verify2faRateLimit,
  profileUpdateRateLimit,
  toggle2faRateLimit,
  changeOwnPasswordRateLimit,
};