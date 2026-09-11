const request = require('supertest');
const app = require('../../index');
const pool = require('../../db');
const { validUser, weakPasswordUser } = require('../fixtures/users');

describe('POST /api/auth/register', () => {
  test('✅ should register a new user with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  test('❌ should return 409 if email already exists', async () => {
    // Insert user first
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')`,
      [validUser.email, 'hashed', validUser.first_name, validUser.last_name]
    );

    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already|utilisé|used/i);
  });

  test('❌ should return 400 for weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(weakPasswordUser);

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].field).toBe('password');
  });

  test('❌ should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'invalid-email' });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('email');
  });
});