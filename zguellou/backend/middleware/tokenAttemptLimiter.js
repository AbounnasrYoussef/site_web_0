const pool = require('../db');
const { getMessage } = require('../errors/messages');
const { hashResetToken } = require('../controllers/auth.helpers');
const getLocale = require('../utils/locale');

async function tokenAttemptLimiter(req, res, next) {
  try {
    const token = req.query.token || req.body.token;
    const locale = getLocale(req);

    if (!token) {
      return res.status(400).json({
        error: getMessage('auth/missing_reset_token', locale),
      });
    }

    const tokenHash = hashResetToken(token);
    const result = await pool.query(
      `SELECT id, user_id, attempts, used_at, expires_at
      FROM password_reset_tokens
      WHERE token_hash = $1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: getMessage('auth/invalid_token', locale)
      });
    }

    const stored = result.rows[0];

    if (stored.used_at) {
      return res.status(400).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    if (new Date(stored.expires_at) < new Date()) {
      return res.status(400).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    if (stored.attempts >= 3) {
      await pool.query(
        `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`,
        [stored.id]
      );
      return res.status(429).json({
        error: getMessage('auth/too_many_attempts', locale),
      });
    }

    req.resetToken = stored;
    next();
  } catch (error) {
    next(error);  
  }
}

module.exports = tokenAttemptLimiter;