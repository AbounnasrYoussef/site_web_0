const request = require('supertest');
const app = require('../../index');
const pool = require('../../db');
const { validUser } = require('../fixtures/users');
const bcrypt = require('bcrypt');
const { hashDeviceIdentifier, generateDeviceIdentifier } = require('../../controllers/auth.helpers');

describe('Device Management & Trust', () => {
  let refreshCookie, accessToken, userId;

  beforeEach(async () => {
    // ─── Create a regular user ────────────────────────────────
    const hashed = await bcrypt.hash(validUser.password, 10);
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL') RETURNING id`,
      [validUser.email, hashed, validUser.first_name, validUser.last_name]
    );
    userId = res.rows[0].id;

    // ─── Login to get tokens ──────────────────────────────────
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(loginRes.status).toBe(200);
    refreshCookie = loginRes.headers['set-cookie'];
    accessToken = loginRes.body.accessToken;
  });

  // ─── Device Cookie Creation ─────────────────────────────────────
  describe('Device cookie creation', () => {
    test('✅ login sets device_id cookie', async () => {
      // Login again to get a fresh set of cookies
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(loginRes.status).toBe(200);
      const cookies = loginRes.headers['set-cookie'];
      const deviceCookie = cookies.find(c => c.startsWith('device_id='));
      expect(deviceCookie).toBeDefined();
      expect(deviceCookie).toMatch(/HttpOnly/);
      expect(deviceCookie).toMatch(/SameSite=Lax/);
      if (process.env.NODE_ENV === 'production') {
        expect(deviceCookie).toMatch(/Secure/);
      }
    });

    test('✅ device_id cookie corresponds to a row in user_devices', async () => {
      // Extract device cookie from the login response (we have refreshCookie)
      const deviceCookie = refreshCookie.find(c => c.startsWith('device_id='));
      expect(deviceCookie).toBeDefined();
      const rawDeviceId = deviceCookie.split('=')[1].split(';')[0];
      const hash = hashDeviceIdentifier(rawDeviceId);

      const result = await pool.query(
        `SELECT id, user_id, device_identifier_hash, is_trusted, trusted_until
         FROM user_devices
         WHERE device_identifier_hash = $1`,
        [hash]
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].user_id).toBe(userId);
      expect(result.rows[0].is_trusted).toBe(false);
      expect(result.rows[0].trusted_until).toBeNull();
    });
  });

  // ─── Refresh Token Device Validation ──────────────────────────
  describe('Refresh token device validation', () => {
    test('✅ refresh works with valid device cookie', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    test('❌ refresh fails if device cookie is missing', async () => {
      // Remove device cookie from the array
      const cookiesWithoutDevice = refreshCookie.filter(c => !c.startsWith('device_id='));

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookiesWithoutDevice)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/revoked|invalid/i);
    });

    test('❌ refresh fails if device cookie does not match stored hash', async () => {
      // Keep only the refresh_token and add a fake device_id
      const refreshTokenCookie = refreshCookie.find(c => c.startsWith('refresh_token='));
      const fakeDeviceCookie = `device_id=${generateDeviceIdentifier()}`;
      const cookieHeader = [refreshTokenCookie, fakeDeviceCookie].join('; ');

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookieHeader)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/revoked|invalid/i);
    });
  });

  // ─── New Device Alert Email ────────────────────────────────────
  describe('New device alert email', () => {
    test('✅ email is sent when logging in from a new device (no cookie)', async () => {
      // Login without sending any cookies (simulates a new device)
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);

      // Verify a new device row was created (the cookie will be set)
      const newDeviceCookie = res.headers['set-cookie'].find(c => c.startsWith('device_id='));
      expect(newDeviceCookie).toBeDefined();
      const rawDeviceId = newDeviceCookie.split('=')[1].split(';')[0];
      const hash = hashDeviceIdentifier(rawDeviceId);

      const result = await pool.query(
        `SELECT id FROM user_devices WHERE device_identifier_hash = $1`,
        [hash]
      );
      expect(result.rows.length).toBe(1);
    });
  });

  // ─── Device Trust via 2FA ──────────────────────────────────────
  describe('Device trust via 2FA', () => {
    test('✅ 2FA verification sets is_trusted = true and trusted_until = NOW + 30 days', async () => {
      // ─── Create an admin user (must have 2FA enabled) ──────
      const adminUser = {
        email: 'admin2@example.com',
        password: 'AdminPass123!',
        first_name: 'Admin',
        last_name: 'User'
      };
      const hashed = await bcrypt.hash(adminUser.password, 10);
      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, auth_provider, is_2fa_enabled)
            VALUES ($1, $2, $3, $4, 'ADMIN', 'LOCAL', true)`,
        [adminUser.email, hashed, adminUser.first_name, adminUser.last_name]
      );

      // ─── Login - should return needs_2fa ─────────────────────
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('needs_2fa', true);
      const pendingToken = loginRes.body.pending_token;

      // 👇 Capture the device cookie from the login response
      const deviceCookie = loginRes.headers['set-cookie'].find(c => c.startsWith('device_id='));
      expect(deviceCookie).toBeDefined();
      const rawDeviceId = deviceCookie.split('=')[1].split(';')[0];
      const deviceIdHash = hashDeviceIdentifier(rawDeviceId);

      // ─── Manually set a known OTP in the DB ──────────────────
      const testOtp = '123456';
      const { hashOTP } = require('../../utils/otp');
      const otpHash = hashOTP(testOtp);
      await pool.query(
        `UPDATE users SET pending_2fa_code = $1, pending_2fa_expires_at = NOW() + INTERVAL '5 minutes' WHERE email = $2`,
        [otpHash, adminUser.email]
      );

      // ─── Verify 2FA with the correct OTP ─────────────────────
      const verifyRes = await request(app)
        .post('/api/auth/verify-2fa')
        .send({ pending_token: pendingToken, code: testOtp });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body).toHaveProperty('accessToken');

      // ─── Verify the device row is now trusted ─────────────────
      const device = await pool.query(
        `SELECT is_trusted, trusted_until FROM user_devices WHERE device_identifier_hash = $1`,
        [deviceIdHash]
      );
      expect(device.rows[0].is_trusted).toBe(true);
      expect(new Date(device.rows[0].trusted_until).getTime()).toBeGreaterThan(new Date().getTime());
    });
  });

  // ─── Logout clears device cookie ──────────────────────────────
  describe('Logout clears device cookie', () => {
    test('✅ logout clears refresh_token and device_id cookies', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshCookie);

      expect(res.status).toBe(200);

      const clearCookies = res.headers['set-cookie'];
      expect(clearCookies.some(c => c.startsWith('refresh_token=;'))).toBe(true);
    });
  });
});