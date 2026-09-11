const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../db');


const { JWT_SECRET, PENDING_2FA_SECRET } = process.env;
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN) || 900;
const REFRESH_TOKEN_BYTES = 32;

function generateRefreshToken() {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function verifyPendingToken(pending_token) {
  try {
    return jwt.verify(pending_token, PENDING_2FA_SECRET);
  } catch {
    return null;
  }
}

function getDeviceFingerprint(req) {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || (req.connection && req.connection.remoteAddress) || '';
  const raw = `${userAgent}|${ip}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function blacklistAccessToken(token) {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) {
    return { success: false };
  }
  const expiresAt = new Date(decoded.exp * 1000);
  const effectiveUserId = decoded.id;
  await pool.query(
    `INSERT INTO blacklisted_tokens (token, user_id, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (token) DO NOTHING`,
    [token, effectiveUserId, expiresAt]
  );
  return { success: true };
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');   // 64-char hex string
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generatePendingToken(userId, deviceId = null) {
  return jwt.sign(
    { id: userId, deviceId },
    PENDING_2FA_SECRET,
    { expiresIn: process.env.PENDING_2FA_EXPIRES_IN }
  );
}

function decodeToken(token) {
  return jwt.decode(token);
}

function generateDeviceIdentifier() {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

function hashDeviceIdentifier(deviceId) {
  return crypto.createHash('sha256').update(deviceId).digest('hex');
}

function generateRevokeToken(userId, deviceId) {
  return jwt.sign(
    { id: userId, deviceId },
    PENDING_2FA_SECRET,
    { expiresIn: '7d' } // Long expiry for email links
  );
}

function generateRandomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

async function getUserDiplomaWithFields(userId, locale) {
  const result = await pool.query(
    `SELECT 
       ud.id AS user_diploma_id,
       ud.general_grade,
       ud.obtained_year,
       d.id AS diploma_id,
       d.code AS diploma_name,
       COALESCE(dt.name, d.code) AS diploma_name,
       json_agg(
         json_build_object(
           'field_id', f.id,
           'field_name', COALESCE(ft.name, f.id::text),
           'value', udf.value
         )
       ) FILTER (WHERE f.id IS NOT NULL) AS fields
     FROM user_diplomas ud
     JOIN diplomas d ON d.id = ud.diploma_id
     LEFT JOIN diploma_translations dt ON dt.diploma_id = d.id AND dt.locale = $2
     LEFT JOIN user_diploma_fields udf ON udf.user_diploma_id = ud.id
     LEFT JOIN fields f ON f.id = udf.field_id
     LEFT JOIN field_translations ft ON ft.field_id = f.id AND ft.locale = $2
     WHERE ud.user_id = $1
     GROUP BY ud.id, d.id, dt.name
  `,
    [userId, locale]
  );
  return result.rows[0] || null;
}

async function getUserInterestedCategories(userId, locale) {
  const result = await pool.query(
    `SELECT 
       c.id AS category_id,
       COALESCE(ct.name, c.name) AS category_name,
       c.name AS category_slug
     FROM user_interested_categories uic
     JOIN categories c ON c.id = uic.category_id
     LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $2
     WHERE uic.user_id = $1
     ORDER BY category_name
    `,
    [userId, locale]
  );
  return result.rows;
}

async function getFullUserProfile(userId, locale) {
  locale = locale.toUpperCase();
  const userResult = await pool.query(
    `SELECT id, first_name, last_name, email, role, year_of_birth, is_dropout,     
      profile_pic, auth_provider, is_2fa_enabled, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );
  if (userResult.rows.length === 0) return null;
  const user = userResult.rows[0];

  const diploma = await getUserDiplomaWithFields(userId, locale);

  const categories = await getUserInterestedCategories(userId, locale);

  return {
    ...user,
    diploma: diploma || null,
    interested_categories: categories || [],
  };
}


module.exports = {
  generateRefreshToken,
  hashRefreshToken,
  generateAccessToken,
  verifyAccessToken,
  getDeviceFingerprint,
  blacklistAccessToken,
  generateResetToken,
  hashResetToken,
  verifyPendingToken,
  generatePendingToken,
  decodeToken,
  generateDeviceIdentifier,
  hashDeviceIdentifier,
  generateRevokeToken,
  generateRandomHex,

  getFullUserProfile,
  getUserDiplomaWithFields,
  getUserInterestedCategories
};