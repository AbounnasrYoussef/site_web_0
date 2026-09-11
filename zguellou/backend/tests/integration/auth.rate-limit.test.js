const pool = require('../../db');
const { validUser } = require('../fixtures/users');
const bcrypt = require('bcrypt');

describe('Rate Limiting on /login', () => {
  let app;
  let request;

  beforeAll(async () => {
    jest.resetModules();
    process.env.AUTH_RATE_LIMIT_MAX = '5';
    app = require('../../index');
    request = require('supertest');
  });

  afterAll(async () => {
    delete process.env.AUTH_RATE_LIMIT_MAX;
    jest.resetModules();
  });

  beforeEach(async () => {
    const hashed = await bcrypt.hash(validUser.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')`,
      [validUser.email, hashed, validUser.first_name, validUser.last_name]
    );
  });

  test('⏱️ should return 429 after exceeding the limit', async () => {
    const payload = { email: validUser.email, password: validUser.password };

    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send(payload);
      expect(res.status).toBe(200);
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send(payload);

    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many|trop de/i);
  }, 30000);
});