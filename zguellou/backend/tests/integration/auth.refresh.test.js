const request = require('supertest');
const app = require('../../index');
const pool = require('../../db');
const { validUser } = require('../fixtures/users');
const bcrypt = require('bcrypt');

describe('POST /api/auth/refresh', () => {
  let refreshCookie;
  let oldAccessToken;
  beforeEach(async () => {
    // Create user
    const hashed = await bcrypt.hash(validUser.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')`,
      [validUser.email, hashed, validUser.first_name, validUser.last_name]
    );

    // Login to get refresh cookie AND access token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    refreshCookie = loginRes.headers['set-cookie'];
    oldAccessToken = loginRes.body.accessToken;   // save the access token
  });

  test('✅ should refresh access token with valid cookie', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie)
      .set('Authorization', `Bearer ${oldAccessToken}`);   // <-- add old token

    const cookies = res.headers['set-cookie'];

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(cookies.some(c => c.includes('refresh_token'))).toBe(true);
  });

  test('❌ should return 401 if refresh token is reused (reuse detection)', async () => {
    const firstRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie)
      .set('Authorization', `Bearer ${oldAccessToken}`);
    expect(firstRes.status).toBe(200);

    const secondRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie)
      .set('Authorization', `Bearer ${oldAccessToken}`);

    expect(secondRes.status).toBe(401);
    expect(secondRes.body.error).toMatch(/revoked|reuse|invalid/i);
  });

  test('❌ should return 400 if no refresh cookie', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${oldAccessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });
});