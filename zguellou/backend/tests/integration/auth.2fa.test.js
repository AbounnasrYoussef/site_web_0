const request = require('supertest');
const app = require('../../index');
const pool = require('../../db');
const bcrypt = require('bcrypt');
const { hashOTP } = require('../../utils/otp');

describe('2FA Flow', () => {
  const adminUser = {
    email: 'admin2fa@example.com',
    password: 'AdminPass123!',
    first_name: 'Admin',
    last_name: 'TwoFA'
  };
  const User = {
    email: 'user2fa@example.com',
    password: 'UserPass123!',
    first_name: 'User',
    last_name: 'TwoFA'
  };

  beforeEach(async () => {
    // ─── Create the admin user fresh for each test ──────────
    const hashed = await bcrypt.hash(adminUser.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, auth_provider, is_2fa_enabled)
       VALUES ($1, $2, $3, $4, 'ADMIN', 'LOCAL', true)`,
      [adminUser.email, hashed, adminUser.first_name, adminUser.last_name]
    );

    // ─── Reset 2FA state ──────────────────────────────────────
    await pool.query(
      `UPDATE users SET pending_2fa_code = NULL, pending_2fa_expires_at = NULL,
       pending_2fa_attempts = 0, pending_2fa_request_count = 0,
       pending_2fa_request_reset = NULL, must_change_password = false
       WHERE email = $1`,
      [adminUser.email]
    );

    // ─── Create the user user fresh for each test ──────────
    const hashedPassword = await bcrypt.hash(User.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, auth_provider, is_2fa_enabled)
       VALUES ($1, $2, $3, $4, 'USER', 'LOCAL', false)`,
      [User.email, hashedPassword, User.first_name, User.last_name]
    );

    // ─── Reset 2FA state ──────────────────────────────────────
    await pool.query(
      `UPDATE users SET pending_2fa_code = NULL, pending_2fa_expires_at = NULL,
       pending_2fa_attempts = 0, pending_2fa_request_count = 0,
       pending_2fa_request_reset = NULL, must_change_password = false
       WHERE email = $1`,
      [adminUser.email]
    );
  });

  // ─── 2FA Activation ─────────────────────────────────────────────
  describe('2FA Activation on Login', () => {
    test('✅ login returns needs_2fa when user has 2FA enabled', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('needs_2fa', true);
      expect(res.body).toHaveProperty('pending_token');
      expect(res.body).toHaveProperty('otp_expires_at');
      expect(res.body).not.toHaveProperty('accessToken');
      expect(res.headers['set-cookie'].some(c => c.startsWith('device_id='))).toBe(true);
    });

    test('✅ valid OTP completes 2FA and returns accessToken', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });

      expect(loginRes.status).toBe(200);
      const pendingToken = loginRes.body.pending_token;

      const testOtp = '123456';
      const otpHash = hashOTP(testOtp);
      await pool.query(
        `UPDATE users SET pending_2fa_code = $1, pending_2fa_expires_at = NOW() + INTERVAL '5 minutes' WHERE email = $2`,
        [otpHash, adminUser.email]
      );

      const verifyRes = await request(app)
        .post('/api/auth/verify-2fa')
        .send({ pending_token: pendingToken, code: testOtp });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body).toHaveProperty('accessToken');
      expect(verifyRes.body.user.email).toBe(adminUser.email);
      expect(verifyRes.headers['set-cookie'].some(c => c.startsWith('refresh_token='))).toBe(true);
    });

    test('❌ invalid OTP returns 401 and increments attempts', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });

      expect(loginRes.status).toBe(200);
      const pendingToken = loginRes.body.pending_token;

      const testOtp = '123456';
      const otpHash = hashOTP(testOtp);
      await pool.query(
        `UPDATE users SET pending_2fa_code = $1, pending_2fa_expires_at = NOW() + INTERVAL '5 minutes' WHERE email = $2`,
        [otpHash, adminUser.email]
      );

      const wrongRes = await request(app)
        .post('/api/auth/verify-2fa')
        .send({ pending_token: pendingToken, code: '999999' });

      expect(wrongRes.status).toBe(401);
      expect(wrongRes.body.error).toMatch(/invalid|incorrect/i);

      const user = await pool.query(
        `SELECT pending_2fa_attempts FROM users WHERE email = $1`,
        [adminUser.email]
      );
      expect(user.rows[0].pending_2fa_attempts).toBe(1);
    });
  });

  // ─── OTP Attempt Limits (4 tries: 3 wrong → 4th triggers 429) ──
  describe('OTP Attempt Limits', () => {
    test('❌ 3 wrong attempts → 401, 4th → 429 and invalidates OTP', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });

      expect(loginRes.status).toBe(200);
      const pendingToken = loginRes.body.pending_token;

      const testOtp = '123456';
      const otpHash = hashOTP(testOtp);
      await pool.query(
        `UPDATE users SET pending_2fa_code = $1, pending_2fa_expires_at = NOW() + INTERVAL '5 minutes' WHERE email = $2`,
        [otpHash, adminUser.email]
      );

      // Send wrong OTP 4 times: first 3 → 401, 4th → 429
      for (let i = 0; i < 4; i++) {
        const res = await request(app)
          .post('/api/auth/verify-2fa')
          .send({ pending_token: pendingToken, code: '999999' });
        if (i < 3) {
          expect(res.status).toBe(401);
        } else {
          expect(res.status).toBe(429);
          expect(res.body.error).toMatch(/too many 2FA attempts|trop de tentatives/i);
        }
      }

      // OTP should be invalidated
      const user = await pool.query(
        `SELECT pending_2fa_code FROM users WHERE email = $1`,
        [adminUser.email]
      );
      expect(user.rows[0].pending_2fa_code).toBeNull();
    });
  });

  // ─── Resend OTP Limits (5 per hour) ───────────────────────────
  describe('Resend OTP Rate Limits (5 per hour)', () => {
    test('❌ resend fails after 5 total OTP requests within the hour', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });

      expect(loginRes.status).toBe(200);
      const pendingToken = loginRes.body.pending_token;

      // After login, pending_2fa_request_count = 1.
      // We need 4 more resends to reach 5 total, then the 5th resend (6th total) should be rate-limited.
      for (let i = 0; i < 4; i++) {
        const res = await request(app)
          .post('/api/auth/resend-2fa')
          .send({ pending_token: pendingToken });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('pending_token');
        expect(res.body).toHaveProperty('otp_expires_at');
      }

      // 5th resend (6th total) - should be 429
      const rateLimited = await request(app)
        .post('/api/auth/resend-2fa')
        .send({ pending_token: pendingToken });

      expect(rateLimited.status).toBe(429);
      expect(rateLimited.body).toHaveProperty('reset_after');
      expect(rateLimited.body.error).toMatch(/too many|trop de/i);
    });
  });

  // ─── Revoke All Sessions ───────────────────────────────────────
  describe('Revoke All Sessions (This wasn\'t me)', () => {
    test('✅ revoke-all sets must_change_password = true, forces password change, and clears flag', async () => {
      // 1. Login as admin to get a pending token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });

      expect(loginRes.status).toBe(200);
      const pendingToken = loginRes.body.pending_token;

      // 2. Call revoke-all on the admin
      const revokeRes = await request(app)
        .post('/api/auth/2fa/revoke-all')
        .send({ pending_token: pendingToken });

      expect(revokeRes.status).toBe(200);
      expect(revokeRes.body).toHaveProperty('requires_password_change', true);
      expect(revokeRes.body).toHaveProperty('pending_token');
      expect(revokeRes.body.user.email).toBe(adminUser.email);

      // 3. Check admin's must_change_password flag
      let admin = await pool.query(
        `SELECT must_change_password FROM users WHERE email = $1`,
        [adminUser.email]
      );
      expect(admin.rows[0].must_change_password).toBe(true);

      // 4. Try to login again as admin - should be blocked
      const loginAgain = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });

      expect(loginAgain.status).toBe(200);
      expect(loginAgain.body).toHaveProperty('requires_password_change', true);
      expect(loginAgain.body).toHaveProperty('pending_token');
      expect(loginAgain.body).not.toHaveProperty('accessToken');

      // 5. Change password
      const changeToken = loginAgain.body.pending_token;
      const newPassword = 'NewSecurePass123!';
      const changeRes = await request(app)
        .post('/api/auth/change-password')
        .send({ pending_token: changeToken, new_password: newPassword });

      expect(changeRes.status).toBe(200);
      expect(changeRes.body.message).toMatch(/success/i);

      // 6. must_change_password should now be false
      admin = await pool.query(
        `SELECT must_change_password FROM users WHERE email = $1`,
        [adminUser.email]
      );
      expect(admin.rows[0].must_change_password).toBe(false);
    });

    test('❌ revoke-all with invalid token returns 410', async () => {
      const res = await request(app)
        .post('/api/auth/2fa/revoke-all')
        .send({ pending_token: 'invalid.token.here' });

      expect(res.status).toBe(410);
      expect(res.body.error).toMatch(/invalid|expired/i);
    });
  });
});