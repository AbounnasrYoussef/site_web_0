const bcrypt = require('bcrypt');
const pool = require('../db');
const { getMessage } = require('../errors/messages');
const { blacklistAccessToken, generateResetToken, hashResetToken, verifyPendingToken, 
  generateRefreshToken,
  hashRefreshToken,
  generateAccessToken,
  getDeviceFingerprint,
    generatePendingToken,
  decodeToken,
  generateDeviceIdentifier,
  hashDeviceIdentifier,
  generateRevokeToken,
  generateRandomHex,
  getFullUserProfile
} = require("./auth.helpers")
const refreshTokenModel = require('../models/refreshToken.model');
const { sendResetEmail, sendOTPEmail, sendLockoutAlertEmail, sendNewDeviceAlertEmail } = require('../utils/email');
const getLocale = require('../utils/locale');
const logger = require('../utils/logger');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otp');
const { getLocationFromIP } = require('../utils/geo');
const { OAuth2Client } = require('google-auth-library');



const REFRESH_TOKEN_EXPIRES_IN_SECONDS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 604800;
const REFRESH_TOKEN_EXPIRES_IN_MS = REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000;

const LOGIN_MAX_ATTEMPTS = parseInt(process.env.LOGIN_MAX_ATTEMPTS) || 5;
const LOGIN_LOCKOUT_MINUTES = parseInt(process.env.LOGIN_LOCKOUT_MINUTES) || 15;


const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);


// reused bits
async function issueTokensAndRespond({ user, deviceId, res, redirectBase, newGoogleUser }) {
  const accessTokenPayload = { id: user.id, role: user.role };
  const accessToken = generateAccessToken(accessTokenPayload);

  const refreshTokenRaw = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshTokenRaw);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

  await refreshTokenModel.createRefreshToken({
    userId: user.id,
    tokenHash: refreshTokenHash,
    deviceId: deviceId,
    expiresAt,
  });

  res.cookie('refresh_token', refreshTokenRaw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: parseInt(REFRESH_TOKEN_EXPIRES_IN_MS),
  });

  // OAuth flow redirect
  if (redirectBase) {
    redirectBase += newGoogleUser ? '/onboarding' : '/profile';
    if (newGoogleUser) {
      res.cookie('onboarding_entry', 'granted', { 
        httpOnly: false,
        maxAge: 5 * 60 * 1000 // 5min
      });
    }
    return res.redirect(`${redirectBase}?oauth=success`);
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      profile_pic: user.profile_pic, 
    },
    accessToken,
  });
}

async function sendOTPChallenge({ user, deviceId, locale, res, redirectBase }) {
  const now = new Date();
  let requestCount = user.pending_2fa_request_count || 0;
  let requestReset = user.pending_2fa_request_reset;

  if (requestReset && new Date(requestReset) < now) {
    requestCount = 0;
    requestReset = null;
  }

  if (requestCount >= 5) {
    return res.status(429).json({
      error: getMessage('auth/2fa_request_limit', locale),
    });
  }

  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await pool.query(
    `UPDATE users
     SET pending_2fa_code = $1,
         pending_2fa_expires_at = $2,
         pending_2fa_attempts = 0,
         pending_2fa_request_count = $3,
         pending_2fa_request_reset = $4
     WHERE id = $5`,
    [otpHash, expiresAt, requestCount + 1, requestReset || new Date(Date.now() + 60 * 60 * 1000), user.id]
  );

  const pendingToken = generatePendingToken(user.id, deviceId);

  await sendOTPEmail({
    to: user.email,
    otp,
    locale,
    pendingToken,
  });

  // For OAuth (redirect flow) vs LOCAL (JSON flow)
  if (redirectBase) {
    const redirectUrl = `${redirectBase}/verify-2fa?token=${pendingToken}&email=${encodeURIComponent(user.email)}&expires_at=${expiresAt.toISOString()}`;
    return res.redirect(redirectUrl);
  }

  return res.status(200).json({
    needs_2fa: true,
    pending_token: pendingToken,
    otp_expires_at: expiresAt.toISOString(),
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}

async function completeAuthentication({ user, deviceId, isNewDevice, req, res, redirectBase, newGoogleUser }) {
  const locale = getLocale(req);

  // google users skip forced password change
  if (user.auth_provider === 'LOCAL' && user.must_change_password) {
    const pendingToken = generatePendingToken(user.id, deviceId);
    res.clearCookie('refresh_token');

    // If OAuth flow, redirect to change-password page
    if (redirectBase) {
      return res.redirect(`${redirectBase}/force-change-password?token=${pendingToken}`);
    }

    return res.status(200).json({
      requires_password_change: true,
      pending_token: pendingToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  }

  // device is trusted
  const deviceResult = await pool.query(
    `SELECT is_trusted, trusted_until FROM user_devices WHERE id = $1`,
    [deviceId]
  );
  const device = deviceResult.rows[0];
  const isTrusted = device.is_trusted && new Date(device.trusted_until) > new Date();

  if (isTrusted) {
    return issueTokensAndRespond({ user, deviceId, res, redirectBase });
  }

  // 2FA is required
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN';
  const requires2FA = isAdmin || user.is_2fa_enabled;

  if (requires2FA) {
    return sendOTPChallenge({ user, deviceId, locale, res, redirectBase });
  }

  // No 2FA required, send new device alert
  if (isNewDevice) {
    const revokeToken = generateRevokeToken(user.id, deviceId);
    const location = await getLocationFromIP(req.ip);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';

    await sendNewDeviceAlertEmail({
      to: user.email,
      deviceName: req.body.deviceName || 'Unknown',
      locale,
      revokeToken,
      ip: ipAddress,
      location,
      authProvider: user.auth_provider,
    });
  }

  return issueTokensAndRespond({ user, deviceId, res, redirectBase, newGoogleUser });
}




///////////////////////////////////////

async function register(req, res, next) {
  try {
    const locale = getLocale(req);
    const { email, password, first_name, last_name } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: getMessage('auth/email_in_use', locale),
      });
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (email, first_name, last_name, password_hash, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')
       RETURNING id, email, first_name, last_name, role, created_at`,
      [normalizedEmail, first_name, last_name, passwordHash]
    );
    const user = result.rows[0];

    // make device
    const fingerprint = getDeviceFingerprint(req);
    const rawDeviceId = generateDeviceIdentifier();
    const deviceIdHash = hashDeviceIdentifier(rawDeviceId);

    const newDevice = await pool.query(
      `INSERT INTO user_devices (user_id, device_id, device_identifier_hash, device_name, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        user.id,
        fingerprint,
        deviceIdHash,
        req.body.deviceName || 'Unknown',
        req.headers['user-agent'],
        req.ip
      ]
    );
    const deviceId = newDevice.rows[0].id;

    const accessTokenPayload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(accessTokenPayload);

    const refreshTokenRaw = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshTokenRaw);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

    await refreshTokenModel.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      deviceId: deviceId,
      expiresAt,
    });

    // set cookies
    res.cookie('refresh_token', refreshTokenRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(REFRESH_TOKEN_EXPIRES_IN_MS),
    });
    res.cookie('device_id', rawDeviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30fays
    });

    res.cookie('onboarding_entry', 'granted', { // if you need to update it, update it in google too
      httpOnly: false,
      maxAge: 5 * 60 * 1000 // 5min
    });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      accessToken,
    });

  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const locale = getLocale(req);
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // find user
    const userResult = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, role, auth_provider,
              failed_login_attempts, locked_until, is_2fa_enabled,
              pending_2fa_code, pending_2fa_expires_at, pending_2fa_attempts,
              pending_2fa_request_count, pending_2fa_request_reset, must_change_password
       FROM users
       WHERE email = $1 AND auth_provider = 'LOCAL'`,
      [normalizedEmail]
    );
    const DUMMY_HASH = '$2b$10$5apXnGTweR1Zb3J0gFnEwOUECp9tBMt./zkCIfdYuf3TAieKI8q3a';
    if (userResult.rows.length === 0) {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ error: getMessage('auth/invalid_credentials', locale) });
    }

    const user = userResult.rows[0];

    // check lock
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(403).json({
        error: getMessage('auth/account_locked', locale),
        locked_until: user.locked_until,
      });
    } else if (user.locked_until && new Date(user.locked_until) <= new Date()) {
      await pool.query(
        `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
        [user.id]
      );
      user.failed_login_attempts = 0;
      user.locked_until = null;
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      let locked = null;

      if (newAttempts >= LOGIN_MAX_ATTEMPTS) {
        locked = new Date(Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000);
        if (newAttempts === LOGIN_MAX_ATTEMPTS)
          await sendLockoutAlertEmail({ to: user.email, locale });
      }

      await pool.query(
        `UPDATE users
         SET failed_login_attempts = $1, locked_until = $2
         WHERE id = $3`,
        [newAttempts, locked, user.id]
      );

      return res.status(401).json({
        error: getMessage('auth/invalid_credentials', locale),
      });
    }

    // clear lock
    await pool.query(
      `UPDATE users
       SET failed_login_attempts = 0, locked_until = NULL
       WHERE id = $1`,
      [user.id]
    );

    // device handling
    const deviceCookie = req.cookies?.device_id;
    let deviceId = null;
    let deviceResult = null;
    let isNewDevice = false;

    if (deviceCookie) {
      const deviceIdHash = hashDeviceIdentifier(deviceCookie);
      deviceResult = await pool.query(
        `SELECT id
         FROM user_devices
         WHERE user_id = $1 AND device_identifier_hash = $2`,
        [user.id, deviceIdHash]
      );
    }

    if (deviceResult && deviceResult.rows.length > 0) {
      deviceId = deviceResult.rows[0].id;
      await pool.query(
        `UPDATE user_devices SET last_used_at = NOW()
         WHERE id = $1`,
        [deviceId]
      );
    } else {
      isNewDevice = true;

      const fingerprint = getDeviceFingerprint(req);
      const rawDeviceId = generateDeviceIdentifier();
      const deviceIdHash = hashDeviceIdentifier(rawDeviceId);

      const newDevice = await pool.query(
        `INSERT INTO user_devices (user_id, device_id, device_identifier_hash, device_name, user_agent, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          user.id,
          fingerprint,
          deviceIdHash,
          req.body.deviceName || 'Unknown',
          req.headers['user-agent'],
          req.ip
        ]
      );

      deviceId = newDevice.rows[0].id;
      deviceResult = await pool.query(
        `SELECT id, is_trusted, trusted_until
         FROM user_devices
         WHERE id = $1`,
        [deviceId]
      );

      res.cookie('device_id', rawDeviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
    }

    return completeAuthentication({
      user,
      deviceId,
      isNewDevice,
      req,
      res,
      redirectBase: null, // LOCAL flow uses JSON responses
    });

  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const locale = getLocale(req);
    const refreshToken = req.cookies?.refresh_token;
    const deviceCookie = req.cookies?.device_id;

    // check token
    if (!refreshToken) {
      res.clearCookie('refresh_token');
      res.clearCookie('device_id');
      return res.status(400).json({
        error: getMessage('auth/missing_refresh_token', locale),
      });
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await refreshTokenModel.findRefreshTokenByHash(tokenHash);

    // bad token
    if (!storedToken) {
      res.clearCookie('refresh_token');
      res.clearCookie('device_id');
      return res.status(401).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }
    
    // check reuse
    if (storedToken.revoked_at) {
      const graceMs = 8 * 1000;
      const revokedAgo = Date.now() - new Date(storedToken.revoked_at).getTime();

      if (revokedAgo > graceMs) {
        await refreshTokenModel.revokeAllUserTokens(storedToken.user_id);
        res.clearCookie('refresh_token');
        res.clearCookie('device_id');

        return res.status(401).json({
          error: getMessage('auth/refresh_token_revoked', locale)
        });
      }
    }

    // check time
    if (new Date(storedToken.expires_at) < new Date()) {
      await refreshTokenModel.revokeRefreshToken(storedToken.id);
      res.clearCookie('refresh_token');
      res.clearCookie('device_id');

      return res.status(401).json({
        error: getMessage('auth/refresh_token_expired', locale),
      });
    }

    // check device
    if (!deviceCookie) {
      // await refreshTokenModel.revokeAllUserTokens(storedToken.user_id);
      await refreshTokenModel.revokeRefreshToken(storedToken.id);
      res.clearCookie('refresh_token');
      res.clearCookie('device_id');

      return res.status(401).json({
        error: getMessage('auth/refresh_token_revoked', locale),
      });
    }

    const deviceIdHash = hashDeviceIdentifier(deviceCookie);

    const deviceResult = await pool.query(
      `SELECT id FROM user_devices
       WHERE id = $1 AND device_identifier_hash = $2`,
      [storedToken.device_id, deviceIdHash]
    );

    // bad device
    if (deviceResult.rows.length === 0) {
      await refreshTokenModel.revokeAllUserTokens(storedToken.user_id);
      res.clearCookie('refresh_token');
      res.clearCookie('device_id');

      return res.status(401).json({
        error: getMessage('auth/refresh_token_revoked', locale),
      });
    }

    // save token
    const oldAccessToken = req.headers.authorization?.split(' ')[1];

    if (oldAccessToken) {
      const decoded = decodeToken(oldAccessToken);

      const alreadyBlacklisted = await pool.query(
        `SELECT 1 FROM blacklisted_tokens WHERE token = $1`,
        [oldAccessToken]
      );

      // token reused
      if (alreadyBlacklisted.rows.length > 0) {
        await refreshTokenModel.revokeAllUserTokens(storedToken.user_id);
        res.clearCookie('refresh_token');
        res.clearCookie('device_id');

        return res.status(401).json({
          error: getMessage('auth/refresh_token_revoked', locale),
        });
      }

      if (decoded && decoded.exp) {
        const result = await blacklistAccessToken(oldAccessToken);

        if (!result.success) {
          console.warn('Failed to blacklist old access token:', oldAccessToken);
        }
      } else {
        console.warn('Old access token malformed or missing exp');
      }
    } else {
      console.log('No access token provided');
    }

    // get user
    const user = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [storedToken.user_id]
    );

    // no user
    if (user.rows.length === 0) {
      res.clearCookie('refresh_token');
      res.clearCookie('device_id');

      return res.status(401).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    // new token
    await refreshTokenModel.revokeRefreshToken(storedToken.id);

    const accessTokenPayload = {
      id: user.rows[0].id,
      role: user.rows[0].role
    };

    const newAccessToken = generateAccessToken(accessTokenPayload);

    const newRefreshTokenRaw = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshTokenRaw);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

    const newToken = await refreshTokenModel.createRefreshToken({
      userId: user.rows[0].id,
      tokenHash: newRefreshTokenHash,
      deviceId: storedToken.device_id,
      expiresAt,
    });

    await refreshTokenModel.revokeOtherDeviceTokens(storedToken.device_id, newToken.id);

    // keep cookie
    res.cookie('device_id', deviceCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    // set cookie
    res.cookie('refresh_token', newRefreshTokenRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(REFRESH_TOKEN_EXPIRES_IN_MS),
    });

    return res.json({
      accessToken: newAccessToken
    });

  } catch (error) {
    next(error);
  }
}


async function logout(req, res, next) {
  try {
    const locale = getLocale(req);

    // get token
    const token = req.headers.authorization?.split(' ')[1];
    if (token) 
      await blacklistAccessToken(token);

    // check token
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      const tokenHash = hashRefreshToken(refreshToken);
      const stored = await refreshTokenModel.findRefreshTokenByHash(tokenHash);

      // stop token
      if (stored && !stored.revoked_at) {
        await refreshTokenModel.revokeRefreshToken(stored.id);
      }
    }

    // clear cookie
    res.clearCookie('refresh_token');

    return res.json({
      message: getMessage('success/logged_out', locale)
    });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const locale = getLocale(req);
    const userId = req.user.id;
    const user = await getFullUserProfile(userId, locale);
    if (!user) {
      return res.status(404).json({
        error: getMessage('auth/user_not_found', locale),
      });
    }
    return res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function validateToken(req, res, next) {
  try {
    const locale = getLocale(req);
    const user = req.user;
    
    const result = await pool.query(
      `SELECT id, role
       FROM users
       WHERE id = $1`,
      [user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        valid: false, 
        error: getMessage('auth/user_not_found', locale)
      });
    }
    
    const userData = result.rows[0];
    
    return res.status(200).json({
      valid: true,
      user: {
        id: userData.id,
        role: userData.role
      }
    });
  } catch (error) {
    error.sendValid = true;
    next(error);
  }
}

async function cleanupBlacklistedTokens(req, res, next) { // hadi khasha tkon cron job
  try {
    await pool.query('DELETE FROM blacklisted_tokens WHERE expires_at < NOW()');
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res) {
  const locale = getLocale(req);
  const genericMessage = getMessage('auth/reset_email_sent', locale);
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();


    const userResult = await pool.query(
      `SELECT id, email FROM users WHERE email = $1 AND auth_provider = 'LOCAL'`,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0)
      return res.json({ message: genericMessage });

    const user = userResult.rows[0];

    // 60s cool down to prevent spamming the user inbox in case of slow email
    const recent = await pool.query(
      `SELECT 1 FROM password_reset_tokens
       WHERE user_id = $1
         AND used_at IS NULL
         AND created_at > NOW() - INTERVAL '60 seconds'
       LIMIT 1`,
      [user.id]
    );

    if (recent.rows.length > 0) {
      return res.json({ message: genericMessage });
    }

    await pool.query(
      `UPDATE password_reset_tokens SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [user.id]
    );

    const rawToken = generateResetToken();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.FORGOT_PASSWORD_EXPIRES_IN) * 1000) );

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    const frontendBase = process.env.FRONTEND_URL;
    const resetLink = `${frontendBase}/reset-password?token=${rawToken}`;

    await sendResetEmail({ to: user.email, resetLink, locale });

    return res.json({ message: genericMessage });
  } catch (error) {
    console.error('Full forgotPassword error:', error);
    logger.error('Forgot password error', {
      error: error,
      stack: error.stack,
    });
    return res.json({ message: genericMessage });
  }
}

async function resetPassword(req, res, next) {
  try {
    const locale = getLocale(req);
    const { password } = req.body;
    const stored = req.resetToken;   // attached by tokenAttemptLimiter middleware

    if (!stored || !stored.user_id) {
      return res.status(400).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    const userResult = await pool.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [stored.user_id]
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    const isSameAsOld = await bcrypt.compare(password, userResult.rows[0].password_hash);
    if (isSameAsOld) {
      return res.status(400).json({
        error: getMessage('auth/password_same_as_old', locale),
      });
    }

    await pool.query(
      `UPDATE password_reset_tokens SET attempts = attempts + 1, used_at = NOW() WHERE id = $1`,
      [stored.id]
    );

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await pool.query(
      `UPDATE users 
       SET password_hash = $1,
           failed_login_attempts = 0,
           locked_until = NULL,
           pending_2fa_request_count = 0,
           pending_2fa_request_reset = NULL,
           pending_2fa_code = NULL,
           pending_2fa_expires_at = NULL,
           pending_2fa_attempts = 0
       WHERE id = $2`,
      [passwordHash, stored.user_id]
    );

    await refreshTokenModel.revokeAllUserTokens(stored.user_id);

    return res.json({ message: getMessage('auth/password_reset_success', locale) });
  } catch (error) {
    next(error);
  }
}

async function cleanupPasswordResetTokens(req, res, next) { // hadi khasha tkon cron job
  try {
    await pool.query(
      `DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used_at IS NOT NULL`
    );
  } catch (error) {
    next(error);
  }
}

async function verify2FA(req, res, next) {
  try {
    const locale = getLocale(req);
    const { pending_token, code } = req.body;

    if (!pending_token || !code) {
      return res.status(400).json({
        error: getMessage('validation/required_field', locale),
      });
    }

    const decoded = verifyPendingToken(pending_token);
    if (!decoded) {
      return res.status(410).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    const userId = decoded.id;
    const deviceId = decoded.deviceId;

    const userResult = await pool.query(
      `SELECT id, email, first_name, last_name, role,
              pending_2fa_code, pending_2fa_expires_at, pending_2fa_attempts
       FROM users
       WHERE id = $1 AND auth_provider = 'LOCAL'`,
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(410).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    const user = userResult.rows[0];

    if (!user.pending_2fa_code || !user.pending_2fa_expires_at || new Date(user.pending_2fa_expires_at) < new Date()) {
      return res.status(400).json({
        error: getMessage('auth/2fa_invalid_code', locale),
      });
    }

    const attempts = user.pending_2fa_attempts || 0;
    if (attempts >= 3) {
      await pool.query(
        `UPDATE users SET pending_2fa_code = NULL, pending_2fa_expires_at = NULL WHERE id = $1`,
        [userId]
      );
      return res.status(429).json({
        error: getMessage('auth/2fa_too_many_attempts', locale),
      });
    }

    const isValid = verifyOTP(code, user.pending_2fa_code);
    if (!isValid) {
      await pool.query(
        `UPDATE users SET pending_2fa_attempts = $1 WHERE id = $2`,
        [attempts + 1, userId]
      );
      return res.status(401).json({
        error: getMessage('auth/2fa_invalid_code', locale),
      });
    }

    await pool.query(
      `UPDATE users
       SET pending_2fa_code = NULL,
           pending_2fa_expires_at = NULL,
           pending_2fa_attempts = 0
       WHERE id = $1`,
      [userId]
    );

    await pool.query(
      `UPDATE user_devices
       SET is_trusted = true,
           trusted_until = NOW() + INTERVAL '30 days'
       WHERE id = $1`,
      [deviceId]
    );

    const accessTokenPayload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(accessTokenPayload);

    const refreshTokenRaw = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshTokenRaw);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

    await refreshTokenModel.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      deviceId: deviceId,
      expiresAt,
    });

    res.cookie('refresh_token', refreshTokenRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(REFRESH_TOKEN_EXPIRES_IN_MS),
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

async function toggle2FA(req, res, next) {
  try {
    const locale = getLocale(req);
    const { password, enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        error: getMessage('validation/required_field', locale),
      });
    }

    const userId = req.user.id;

    const userResult = await pool.query(
      `SELECT id, role, password_hash, toggle_2fa_attempts, toggle_2fa_locked_until, auth_provider
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: getMessage('auth/user_not_found', locale),
      });
    }
    
    const user = userResult.rows[0];
    
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      return res.status(403).json({
        error: getMessage('auth/2fa_admin_required', locale),
      });
    }

    if (user.auth_provider !== 'LOCAL') {
      return res.status(400).json({
        error: getMessage('auth/2fa_not_available_for_google', locale)
      });
    }

    if (user.toggle_2fa_locked_until && new Date(user.toggle_2fa_locked_until) > new Date()) {
      return res.status(429).json({
        error: getMessage('auth/toggle_2fa_locked', locale),
        locked_until: user.toggle_2fa_locked_until,
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const newAttempts = (user.toggle_2fa_attempts || 0) + 1;
      let lockedUntil = null;
      if (newAttempts >= 5) {
        lockedUntil = new Date(Date.now() + parseInt(process.env.TOGGLE_2FA_LOCKOUT_MINUTES) * 60 * 1000);
      }
      await pool.query(
        `UPDATE users
         SET toggle_2fa_attempts = $1, toggle_2fa_locked_until = $2
         WHERE id = $3`,
        [newAttempts, lockedUntil, userId]
      );
      return res.status(401).json({
        error: getMessage('auth/invalid_password', locale),
      });
    }

    await pool.query(
      `UPDATE users
       SET is_2fa_enabled = $1,
           toggle_2fa_attempts = 0,
           toggle_2fa_locked_until = NULL
       WHERE id = $2`,
      [enabled, userId]
    );

    return res.json({
      message: getMessage('success/2fa_toggled', locale),
      is_2fa_enabled: enabled,
    });
  } catch (error) {
    next(error);
  }
}

async function revokeAllOnSuspicion(req, res, next) {
  try {
    const locale = getLocale(req);
    const { pending_token } = req.body;

    // check token
    const decoded = verifyPendingToken(pending_token);
    if (!decoded) {
      return res.status(410).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    const userId = decoded.id;

    // get user
    const userResult = await pool.query(
      `SELECT id, email, role FROM users WHERE id = $1`,
      [userId]
    );

    // no user
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: getMessage('auth/user_not_found', locale),
      });
    }

    const user = userResult.rows[0];

    // stop tokens
    await refreshTokenModel.revokeAllUserTokens(userId);

    // untrust ALL devices
    await pool.query(
      `UPDATE user_devices
       SET is_trusted = false, trusted_until = NULL
       WHERE user_id = $1`,
      [userId]
    );

    // reset 2fa
    await pool.query(
      `UPDATE users 
       SET pending_2fa_code = NULL, 
           pending_2fa_expires_at = NULL, 
           pending_2fa_attempts = 0,
           must_change_password = true
       WHERE id = $1`,
      [userId]
    );

    // new token
    const pendingToken = generatePendingToken(user.id);

    // clear cookie
    res.clearCookie('refresh_token');
    res.clearCookie('device_id');

    return res.status(200).json({
      requires_password_change: true,
      pending_token: pendingToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const locale = getLocale(req);
    const { pending_token, new_password } = req.body;

    if (!pending_token || !new_password) {
      return res.status(400).json({
        error: getMessage('validation/required_field', locale),
      });
    }

    const decoded = verifyPendingToken(pending_token);
    if (!decoded) {
      return res.status(401).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    const userId = decoded.id;

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(new_password, saltRounds);

    await pool.query(
      `UPDATE users 
       SET password_hash = $1,
           must_change_password = false,
           failed_login_attempts = 0,
           locked_until = NULL,
           pending_2fa_request_count = 0,
           pending_2fa_request_reset = NULL,
           pending_2fa_code = NULL,
           pending_2fa_expires_at = NULL,
           pending_2fa_attempts = 0
       WHERE id = $2`,
      [passwordHash, userId]
    );

    await refreshTokenModel.revokeAllUserTokens(userId);

    return res.json({
      message: getMessage('auth/password_reset_success', locale),
    });
  } catch (error) {
    next(error);
  }
}

async function resend2FA(req, res, next) {
  try {
    const locale = getLocale(req);
    const { pending_token } = req.body;

    if (!pending_token) {
      return res.status(400).json({
        error: getMessage('validation/required_field', locale),
      });
    }

    const decoded = verifyPendingToken(pending_token);
    if (!decoded) {
      return res.status(410).json({
        error: getMessage('auth/invalid_token', locale),
      });
    }

    const userId = decoded.id;
    const deviceId = decoded.deviceId;

    const userResult = await pool.query(
      `SELECT id, email, role, pending_2fa_request_count, pending_2fa_request_reset
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: getMessage('auth/user_not_found', locale),
      });
    }

    const user = userResult.rows[0];

    const now = new Date();
    let requestCount = user.pending_2fa_request_count || 0;
    let requestReset = user.pending_2fa_request_reset;

    if (requestReset && new Date(requestReset) < now) {
      requestCount = 0;
      requestReset = null;
    }

    if (requestCount >= 5) {
      const resetAfter = Math.floor((new Date(requestReset).getTime() - now.getTime()) / 1000);
      return res.status(429).json({
        error: getMessage('auth/2fa_request_limit', locale),
        reset_after: resetAfter,
      });
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `UPDATE users
       SET pending_2fa_code = $1,
           pending_2fa_expires_at = $2,
           pending_2fa_attempts = 0,
           pending_2fa_request_count = $3,
           pending_2fa_request_reset = $4
       WHERE id = $5`,
      [otpHash, expiresAt, requestCount + 1, requestReset || new Date(Date.now() + 60 * 60 * 1000), userId]
    );

    const newPendingToken = generatePendingToken(user.id, deviceId);
    await sendOTPEmail({ to: user.email, otp, locale, pendingToken: newPendingToken });

    return res.json({
      message: getMessage('auth/otp_sent', locale),
      pending_token: newPendingToken,
      otp_expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// GOOGLE
async function googleRedirect(req, res) {
  const state = generateRandomHex(16);
  res.cookie('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000, // 5 minutes
  });

  const url = googleClient.generateAuthUrl({
    scope: ['openid', 'email', 'profile'], // profile pic, first name, last name
    state,
    prompt: 'select_account',
  });

  res.redirect(url);
}

async function uploadProfilePictureFromGoogle(googlePicUrl, locale) {
  if (!googlePicUrl)
      return null;
  try {
    const response = await fetch(googlePicUrl);
    if (!response.ok)
      throw new Error(`Download failed: ${response.status}`);

    const contentType = response.headers.get('content-type') || 'image/jpeg';

    const EXTENSION_BY_MIME = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const extension = EXTENSION_BY_MIME[contentType] || 'jpg';

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const formData = new FormData();
    formData.append('image', new Blob([buffer], { type: contentType }), `profile.${extension}`);
    formData.append('upload_dir', 'auth/profile');

    const uploaderUrl = process.env.PRIVATE_UPLOADER_API_URL;
    const uploadRes = await fetch(`${uploaderUrl}/uploader?lang=${locale}`, {
      method: 'POST',
      body: formData
    });

    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}));
      throw new Error(errData.message || 'Upload failed');
    }

    const data = await uploadRes.json();
    return data.path;
  } catch (error) {
    console.error('Failed to upload profile picture from Google:', error.message, error.cause);
    return null;
  }
}
async function googleCallback(req, res, next) {
  try {
    const locale = getLocale(req);
    const { code, state } = req.query;
    const expectedState = req.cookies?.google_oauth_state;
    res.clearCookie('google_oauth_state');

    // CSRF validation kayna fl RFC 
    if (!code || !state || !expectedState || state !== expectedState) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${getMessage('auth/oauth_invalid_state', locale)}`);
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    });

    // Verify ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // CHECK EMAIL VERIFIED FIRST
    if (!payload.email_verified) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${getMessage('auth/oauth_email_unverified', locale)}`);
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const firstName = payload.given_name || null;
    const lastName = payload.family_name || null;
    const profilePic = payload.picture || null;

    let userResult = await pool.query(
      `SELECT * FROM users WHERE google_id = $1 AND auth_provider = 'GOOGLE'`,
      [googleId]
    );

    let user = userResult.rows[0];
    let newGoogleUser = false;
    if (!user) {
      // Check if email is already used by a LOCAL account
      const emailMatch = await pool.query(
        `SELECT id, auth_provider FROM users WHERE LOWER(email) = LOWER($1)`,
        [email]
      );

      if (emailMatch.rows.length > 0 && emailMatch.rows[0].auth_provider === 'LOCAL') {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${getMessage('auth/oauth_email_registered_local', locale)}`);
      }

      const uploadedPicUrl = await uploadProfilePictureFromGoogle(profilePic, locale);

      const created = await pool.query(
        `INSERT INTO users (email, first_name, last_name, google_id, auth_provider, profile_pic)
         VALUES ($1, $2, $3, $4, 'GOOGLE', $5)
         RETURNING *`,
        [email, firstName, lastName, googleId, uploadedPicUrl]
      );
      user = created.rows[0];
      newGoogleUser = true;
    }

    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${getMessage('auth/oauth_not_allowed_for_role', locale)}`);
    }

    // Device handling
    let deviceId = null;
    let isNewDevice = false;
    let rawDeviceId = null;
    let deviceIdHash = null;

    const deviceCookie = req.cookies?.device_id;
    if (deviceCookie) {
      deviceIdHash = hashDeviceIdentifier(deviceCookie);
      const found = await pool.query(
        `SELECT id FROM user_devices
        WHERE user_id = $1 AND device_identifier_hash = $2`,
        [user.id, deviceIdHash]
      );
      if (found.rows.length > 0) {
        deviceId = found.rows[0].id;
        rawDeviceId = deviceCookie;
        await pool.query(
          `UPDATE user_devices SET last_used_at = NOW() WHERE id = $1`,
          [deviceId]
        );
      }
    }

    if (!deviceId) {
      const fingerprint = getDeviceFingerprint(req);
      const found = await pool.query(
        `SELECT id FROM user_devices
        WHERE user_id = $1 AND device_id = $2`,
        [user.id, fingerprint]
      );
      if (found.rows.length > 0) {
        deviceId = found.rows[0].id;

        rawDeviceId = generateDeviceIdentifier();
        deviceIdHash = hashDeviceIdentifier(rawDeviceId);

        await pool.query(
          `UPDATE user_devices
          SET last_used_at = NOW(), device_identifier_hash = $1
          WHERE id = $2`,
          [deviceIdHash, deviceId]
        );
      }
    }

    if (!deviceId) {
      const fingerprint = getDeviceFingerprint(req);
      rawDeviceId = generateDeviceIdentifier();
      deviceIdHash = hashDeviceIdentifier(rawDeviceId);
      isNewDevice = true;

      const newDevice = await pool.query(
        `INSERT INTO user_devices (user_id, device_id, device_identifier_hash, device_name, user_agent, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          user.id,
          fingerprint,
          deviceIdHash,
          req.body.deviceName || 'Unknown',
          req.headers['user-agent'],
          req.ip,
        ]
      );
      deviceId = newDevice.rows[0].id;
    }

    res.cookie('device_id', rawDeviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    // Complete authentication
    return completeAuthentication({
      user,
      deviceId,
      isNewDevice,
      req,
      res,
      redirectBase: process.env.FRONTEND_URL, // OAuth flow uses redirects
      newGoogleUser
    });
  } catch (error) {
    next(error);
  }
}

///////////////////////// UPDATE PROFILE
async function replaceUserInterests(userId, ids, tableName, idColumn) {
  if (!Array.isArray(ids)) 
    return;
  await pool.query('BEGIN');
  try {
    await pool.query(`DELETE FROM ${tableName} WHERE user_id = $1`, [userId]);
    if (ids.length > 0) {
      const placeholders = ids.map((_, i) => `($1, $${i + 2})`).join(', ');
      await pool.query(
        `INSERT INTO ${tableName} (user_id, ${idColumn}) VALUES ${placeholders}`,
        [userId, ...ids]
      );
    }
    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }
}

async function deleteOldProfileImage(imageUrl, locale = 'en') {
  if (!imageUrl) return;
  try {
    const response = await fetch(`${process.env.PRIVATE_UPLOADER_API_URL}/uploader?lang=${locale}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Failed to delete old profile picture: ${imageUrl} - ${errorText}`);
    }
  } catch (error) {
    logger.error(`Error deleting old profile picture: ${imageUrl} - ${error.message}`);
  }
}

async function uploadFileToUploader(fileBuffer, mimetype, locale) {
  const formData = new FormData();
  const extension = mimetype.split('/')[1] || 'jpg';
  const blob = new Blob([fileBuffer], { type: mimetype });
  formData.append('image', blob, `profile.${extension}`);
  formData.append('upload_dir', 'auth/profile');

  const uploaderUrl = process.env.PRIVATE_UPLOADER_API_URL;
  const response = await fetch(`${uploaderUrl}/uploader?lang=${locale}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Upload failed');
  }

  const data = await response.json();
  return data.path;
}


async function updateProfile(req, res, next) {
  const client = await pool.connect();
  try {
    const locale = getLocale(req);
    const userId = req.user.id;

    let {
      first_name, last_name, year_of_birth, is_dropout,
      diploma_id, diploma_note, diploma_year,
      interested_category_ids, diploma_fields,
    } = req.body;

    const errors = [];

    let parsedInterestedCategoryIds;
    if (interested_category_ids !== undefined) {
      try {
        parsedInterestedCategoryIds = JSON.parse(interested_category_ids);
        if (!Array.isArray(parsedInterestedCategoryIds)) {
          errors.push({
            field: 'interested_category_ids',
            message: getMessage('validation/invalid_uuid_array', locale),
          });
        } else {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          for (const id of parsedInterestedCategoryIds) {
            if (!uuidRegex.test(id)) {
              errors.push({
                field: 'interested_category_ids',
                message: getMessage('validation/invalid_uuid', locale),
              });
              break; // one error per field is enough
            }
          }
        }
      } catch {
        errors.push({
          field: 'interested_category_ids',
          message: getMessage('validation/invalid_uuid_array', locale),
        });
      }
    }

    let parsedDiplomaFields;
    if (diploma_fields !== undefined) {
      try {
        parsedDiplomaFields = JSON.parse(diploma_fields);
        if (!Array.isArray(parsedDiplomaFields)) {
          errors.push({
            field: 'diploma_fields',
            message: getMessage('validation/invalid_uuid_array', locale),
          });
        } else {
          // Validate each field
          for (const field of parsedDiplomaFields) {
            const { field_id, value } = field;
            if (!field_id) {
              errors.push({
                field: 'diploma_fields',
                message: getMessage('validation/invalid_diploma_field', locale),
              });
              break;
            }
            if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
              // Use the field_id to map to the specific input
              errors.push({
                field: `diploma_field_${field_id}`,
                message: getMessage('validation/invalid_number', locale),
              });
            }
          }
        }
      } catch {
        errors.push({
          field: 'diploma_fields',
          message: getMessage('validation/invalid_uuid_array', locale),
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    let uploadedPicUrl = null;
    if (req.file) {
      try {
        uploadedPicUrl = await uploadFileToUploader(
          req.file.buffer,
          req.file.mimetype,
          locale
        );
      } catch (uploadErr) {
        logger.error(`Profile picture upload failed: ${uploadErr.message}`);
        return res.status(400).json({
          errors: [{
            field: 'profile_pic',
            message: getMessage('validation/image_upload_failed', locale),
          }],
        });
      }
    }

    // ─── Fetch old profile_pic BEFORE update ───
    const oldPicResult = await client.query(
      `SELECT profile_pic FROM users WHERE id = $1`,
      [userId]
    );
    const oldProfilePic = oldPicResult.rows[0]?.profile_pic;

    // ─── Build dynamic updates ───
    const updates = [];
    const values = [];
    let paramIndex = 1;

    const addField = (field, value) => {
      if (value !== undefined && value !== null && value !== '') {
        updates.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    };

    addField('first_name', first_name?.trim());
    addField('last_name', last_name?.trim());
    addField('year_of_birth', year_of_birth);
    addField('is_dropout', is_dropout);
    if (uploadedPicUrl) {
      addField('profile_pic', uploadedPicUrl);
    }

    const hasAnyUpdate =
      updates.length > 0 ||
      parsedInterestedCategoryIds !== undefined ||
      diploma_id !== undefined;

    if (!hasAnyUpdate) {
      return res.status(400).json({
        errors: [{
          field: 'general',
          message: getMessage('validation/no_fields_to_update', locale),
        }],
      });
    }

    // ─── Begin Transaction
    await client.query('BEGIN');

    // 1. Update user fields
    if (updates.length > 0) {
      values.push(userId);
      await client.query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
        values
      );
    }

    // 2. Update interests (using parsed array)
    if (parsedInterestedCategoryIds !== undefined) {
      await client.query('DELETE FROM user_interested_categories WHERE user_id = $1', [userId]);
      if (Array.isArray(parsedInterestedCategoryIds) && parsedInterestedCategoryIds.length > 0) {
        const placeholders = parsedInterestedCategoryIds.map((_, i) => `($1, $${i + 2})`).join(',');
        await client.query(
          `INSERT INTO user_interested_categories (user_id, category_id) VALUES ${placeholders}`,
          [userId, ...parsedInterestedCategoryIds]
        );
      }
    }

    // 3. Update diplomas
    const isDropoutValue = is_dropout !== undefined ? is_dropout : false;

    if (isDropoutValue) {
      await client.query('DELETE FROM user_diplomas WHERE user_id = $1', [userId]);
    } else if (diploma_id) {
      await client.query('DELETE FROM user_diplomas WHERE user_id = $1', [userId]);

      const upserted = await client.query(
        `INSERT INTO user_diplomas (user_id, diploma_id, general_grade, obtained_year)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, diploma_id, diploma_note ?? null, diploma_year ?? null]
      );
      const userDiplomaId = upserted.rows[0].id;

      if (Array.isArray(parsedDiplomaFields) && parsedDiplomaFields.length > 0) {
        for (const { field_id, value } of parsedDiplomaFields) {
          await client.query(
            `INSERT INTO user_diploma_fields (user_diploma_id, field_id, value)
             VALUES ($1, $2, $3)`,
            [userDiplomaId, field_id, value]
          );
        }
      }
    }

    await client.query('COMMIT');

    // ─── Fire‑and‑forget old image deletion ──────────────────
    if (uploadedPicUrl && oldProfilePic && oldProfilePic !== uploadedPicUrl) {
      deleteOldProfileImage(oldProfilePic, locale);
    }

    const user = await getFullUserProfile(userId, locale);
    return res.json({ user, message: getMessage('success/profile_updated', locale) });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

async function changeOwnPassword(req, res, next) {
  try {
    const locale = getLocale(req);
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    const userResult = await pool.query(
      `SELECT id, password_hash, auth_provider, change_password_attempts, change_password_locked_until FROM users WHERE id = $1`,
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: getMessage('auth/user_not_found', locale) });
    }
    const user = userResult.rows[0];

    if (user.auth_provider !== 'LOCAL') {
      return res.status(400).json({ error: getMessage('auth/password_not_available_for_google', locale) });
    }

    if (user.change_password_locked_until && new Date(user.change_password_locked_until) > new Date()) {
      return res.status(429).json({ error: getMessage('auth/too_many_password_change_attempts', locale) });
    }

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      const attempts = (user.change_password_attempts || 0) + 1;
      const lockedUntil = attempts >= parseInt(process.env.CHANGE_OWN_PASSWORD_ATTEMPTS) ? new Date(Date.now() + parseInt(process.env.CHANGE_OWN_PASSWORD_LOCKOUT_MINUTES) * 60 * 1000) : null;

      await pool.query(
        `UPDATE users
         SET change_password_attempts = $1,
             change_password_locked_until = $2
         WHERE id = $3`,
        [attempts, lockedUntil, userId]
      );

      return res.status(400).json({ error: getMessage('auth/invalid_password', locale) });
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(new_password, saltRounds);

    const isSameAsOld = await bcrypt.compare(new_password, user.password_hash);
    if (isSameAsOld) {
      return res.status(400).json({ error: getMessage('auth/enter_new_password', locale)});
    }

    await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, userId]);

      const rawRefreshToken = req.cookies?.refresh_token;
    const currentRefreshTokenHash = rawRefreshToken ? hashRefreshToken(rawRefreshToken) : null;
    await refreshTokenModel.revokeAllUserTokens(userId, currentRefreshTokenHash);

    return res.json({ message: getMessage('success/password_changed', locale) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  validateToken,
  cleanupBlacklistedTokens,
  resetPassword,
  forgotPassword,
  cleanupPasswordResetTokens,
  toggle2FA,
  verify2FA,
  revokeAllOnSuspicion,
  resend2FA,
  changePassword,
  googleRedirect,
  googleCallback,
  updateProfile,
  changeOwnPassword,
};