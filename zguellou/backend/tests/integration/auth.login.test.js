const request = require('supertest');
const app = require('../../index');
const pool = require('../../db');
const { validUser, hashedTestUser } = require('../fixtures/users');
const bcrypt = require('bcrypt');

describe('POST /api/auth/login', () => {

  beforeEach(async () => {
    // Insert a user with known password
    const hashed = await bcrypt.hash(validUser.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')`,
      [validUser.email, hashed, validUser.first_name, validUser.last_name]
    );
  });

  test('✅ should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    const cookies = res.headers['set-cookie'];
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(cookies.some(c => c.includes('refresh_token'))).toBe(true);  });

  test('❌ should return 401 for invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPass' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  test('❌ should return 401 for non-existent email (generic)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: validUser.password });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  test('❌ should return 400 for missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: validUser.password });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('email');
  });
});

describe('POST /api/auth/login with must_change_password flag', () => {
  let userEmail = 'changeme@example.com';
  let userPassword = 'ChangeMe123!';

  beforeEach(async () => {
    const hashed = await bcrypt.hash(userPassword, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider, must_change_password)
       VALUES ($1, $2, $3, $4, 'LOCAL', true)`,
      [userEmail, hashed, 'Change', 'Me']
    );
  });

  test('🔒 should return requires_password_change when flag is true', async () => {
    // Ensure the flag is set
    await pool.query(
      `UPDATE users SET must_change_password = true WHERE email = $1`,
      [userEmail]
    );

    const check = await pool.query(
      'SELECT must_change_password FROM users WHERE email = $1',
      [userEmail]
    );
    console.log('must_change_password in DB:', check.rows[0].must_change_password);
    expect(check.rows[0].must_change_password).toBe(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userEmail, password: userPassword });

    console.log('Login response body:', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requires_password_change', true);
    expect(res.body).toHaveProperty('pending_token');
    expect(res.body).not.toHaveProperty('accessToken');
    expect(res.body).not.toHaveProperty('needs_2fa');

    // Refresh token should be cleared (either by Max-Age=0 or Expires=1970)
    const cookies = res.headers['set-cookie'];
    const refreshCookie = cookies.find(c => c.startsWith('refresh_token='));
    if (refreshCookie) {
      // Accept either Max-Age=0 or Expires=Thu, 01 Jan 1970
      const isCleared = refreshCookie.includes('Max-Age=0') || refreshCookie.includes('Expires=Thu, 01 Jan 1970');
      expect(isCleared).toBe(true);
    } else {
      // If it's not set at all, that's also acceptable
      expect(refreshCookie).toBeUndefined();
    }
  });

  test('🔓 should allow normal login after must_change_password is cleared', async () => {
    // First, clear the flag manually (simulate password change)
    await pool.query(
      `UPDATE users SET must_change_password = false WHERE email = $1`,
      [userEmail]
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userEmail, password: userPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).not.toHaveProperty('requires_password_change');
  });
});