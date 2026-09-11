const request = require('supertest');
const app = require('../../index');
const pool = require('../../db');
const { validUser } = require('../fixtures/users');
const bcrypt = require('bcrypt');
const { generateAccessToken, hashRefreshToken } = require('../../controllers/auth.helpers');

describe('Token Blacklisting', () => {
  let accessToken;
  let refreshCookie; // array of all set-cookie headers
  let refreshTokenValue; // extracted raw refresh token value
  let userId;

  beforeEach(async () => {
    // ─── Create user ──────────────────────────────────────────
    const hashed = await bcrypt.hash(validUser.password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL') RETURNING id`,
      [validUser.email, hashed, validUser.first_name, validUser.last_name]
    );
    userId = result.rows[0].id;

    // ─── Login to obtain tokens ──────────────────────────────
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(loginRes.status).toBe(200);
    accessToken = loginRes.body.accessToken;
    refreshCookie = loginRes.headers['set-cookie'];

    // Extract raw refresh_token value from cookie
    const refreshTokenCookie = refreshCookie.find(c => c.startsWith('refresh_token='));
    expect(refreshTokenCookie).toBeDefined();
    refreshTokenValue = refreshTokenCookie.split(';')[0].split('=')[1];
  });

  // ─── Refresh ──────────────────────────────────────────────────
  describe('POST /api/auth/refresh', () => {
    test('✅ blacklists old access token after successful refresh', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');

      const blacklist = await pool.query(
        `SELECT * FROM blacklisted_tokens WHERE token = $1`,
        [accessToken]
      );
      expect(blacklist.rows.length).toBe(1);
    });

    test('❌ old refresh token is revoked (reuse detection)', async () => {
      // First refresh - succeeds
      const first = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(first.status).toBe(200);

      // Second refresh with the same refresh cookie - reuse detection
      const second = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(second.status).toBe(401);
      expect(second.body.error).toMatch(/revoked|reuse|invalid/i);

      // All refresh tokens for user should now be revoked
      const tokens = await pool.query(
        `SELECT revoked_at FROM refresh_tokens WHERE user_id = $1`,
        [userId]
      );
      tokens.rows.forEach((row) => expect(row.revoked_at).not.toBeNull());
    });

    test('❌ refuses to refresh if old access token is already blacklisted', async () => {
      // First refresh - blacklists the old access token
      const first = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(first.status).toBe(200);
      const newCookies = first.headers['set-cookie'];

      // Second refresh with the same old access token (now blacklisted)
      const second = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', newCookies)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(second.status).toBe(401);
      expect(second.body.error).toMatch(/revoked|reuse|invalid/i);
    });
  });

  // ─── Logout ────────────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    test('✅ blacklists access token and revokes refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshCookie);

      expect(res.status).toBe(200);

      // 1) Access token blacklisted
      const blacklist = await pool.query(
        `SELECT * FROM blacklisted_tokens WHERE token = $1`,
        [accessToken]
      );
      expect(blacklist.rows.length).toBe(1);

      // 2) Refresh token is either revoked or deleted
      const tokenHash = hashRefreshToken(refreshTokenValue);
      const refreshEntry = await pool.query(
        `SELECT revoked_at FROM refresh_tokens WHERE token_hash = $1`,
        [tokenHash]
      );

      if (refreshEntry.rows.length > 0) {
        // Token exists - must be revoked
        expect(refreshEntry.rows[0].revoked_at).not.toBeNull();
      } else {
        // Token was deleted - that's also acceptable (logout may delete)
        expect(refreshEntry.rows.length).toBe(0);
      }

      // 3) Blacklisted token cannot access protected routes
      const profileRes = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(profileRes.status).toBe(401);
    });
  });

  // ─── Validate ──────────────────────────────────────────────────
  describe('GET /api/auth/validate', () => {
    test('✅ returns valid for clean token', async () => {
      const res = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
    });

    test('❌ returns invalid after token is blacklisted (logout)', async () => {
      // Logout to blacklist the token
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshCookie);

      const res = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
  });
});