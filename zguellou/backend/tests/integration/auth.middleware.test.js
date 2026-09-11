const request = require('supertest');
const app = require('../../index');
const pool = require('../../db');
const { validUser } = require('../fixtures/users');
const bcrypt = require('bcrypt');
const { generateAccessToken } = require('../../controllers/auth.helpers');

describe('Protected Routes (authenticate middleware)', () => {
  let accessToken;
  let userId;

  beforeEach(async () => {
    const hashed = await bcrypt.hash(validUser.password, 10);
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')
       RETURNING id`,
      [validUser.email, hashed, validUser.first_name, validUser.last_name]
    );
    userId = res.rows[0].id;
    accessToken = generateAccessToken({ id: userId, role: 'USER' });
  });

  test('✅ should allow access with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('id', userId);
  });

  test('❌ should return 401 if no Authorization header', async () => {
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.status).toBe(401);
  });

  test('❌ should return 401 for invalid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
  });
});

describe('Authorization (authorize middleware)', () => {
  let adminToken, userToken;

  beforeEach(async () => {
    // Create admin
    const adminRes = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, auth_provider, is_2fa_enabled)
      VALUES ('admin@example.com', 'hashed', 'Admin', 'User', 'ADMIN', 'LOCAL', true)
      RETURNING id`
    );
    adminToken = generateAccessToken({ id: adminRes.rows[0].id, role: 'ADMIN' });

    // Create regular user
    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ('user@example.com', 'hashed', 'Regular', 'User', 'LOCAL')
       RETURNING id`
    );
    userToken = generateAccessToken({ id: userRes.rows[0].id, role: 'USER' });
  });

  test('✅ should allow admin access to admin route', async () => {
    const res = await request(app)
      .get('/api/auth/admin-test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  test('❌ should return 403 for non-admin user', async () => {
    const res = await request(app)
      .get('/api/auth/admin-test')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden.');
  });
});