const { verifyAccessToken } = require('../controllers/auth.helpers');
const { getMessage } = require('../errors/messages');
const pool = require("../db");
const getLocale = require('../utils/locale');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const locale = getLocale(req);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      valid: false,
      error: getMessage('auth/unauthorized', locale),
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({
      valid: false,
      error: getMessage('auth/invalid_token', locale),
    });
  }

  const blacklistResult = await pool.query(
    'SELECT 1 FROM blacklisted_tokens WHERE token = $1',
    [token]
  );
  if (blacklistResult.rows.length > 0) {
    return res.status(401).json({
      valid: false,
      error: getMessage('auth/unauthorized', locale),
    });
  }

  req.user = decoded;
  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    const locale = getLocale(req);

    if (!req.user) {
      return res.status(401).json({
        error: getMessage('auth/unauthorized', locale),
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: getMessage('auth/forbidden', locale),
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };