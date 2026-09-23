const pool = require('../db');

async function createRefreshToken({ userId, tokenHash, deviceId, expiresAt }) {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, device_id, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, device_id, expires_at, created_at`,
    [userId, tokenHash, deviceId, expiresAt]
  );
  return result.rows[0];
}

async function findRefreshTokenByHash(tokenHash) {
  const result = await pool.query(
    `SELECT id, user_id, device_id, expires_at, revoked_at
     FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function revokeRefreshToken(tokenId) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE id = $1`,
    [tokenId]
  );
}

async function revokeAllUserTokens(userId, currentRefreshTokenHash = null) { //logout all devices
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE user_id = $1 AND revoked_at IS NULL AND ($2::text IS NULL OR token_hash != $2)`,
    [userId, currentRefreshTokenHash] //AND revoked_at IS NULL to skip already revoked tokens
  );
}

async function deleteExpiredTokens() {
  const result = await pool.query(
    `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked_at IS NOT NULL`
  );
  return result.rowCount;
}

async function revokeOtherDeviceTokens(deviceId, keepTokenId) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE device_id = $1 AND id != $2 AND revoked_at IS NULL`,
    [deviceId, keepTokenId]
  );
}

module.exports = {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllUserTokens,
  deleteExpiredTokens,
  revokeOtherDeviceTokens,
};