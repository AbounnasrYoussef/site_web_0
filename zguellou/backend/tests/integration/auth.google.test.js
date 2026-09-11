// auth_backend/tests/integration/auth.google.test.js
const request = require('supertest');
const pool = require('../../db');
const bcrypt = require('bcrypt');
const { validUser } = require('../fixtures/users');

// Mock google-auth-library
const mockVerifyIdToken = jest.fn();
const mockGetToken = jest.fn();
const mockGenerateAuthUrl = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    generateAuthUrl: mockGenerateAuthUrl,
    getToken: mockGetToken,
    verifyIdToken: mockVerifyIdToken,
  })),
}));

// Mock generateRandomHex to return a fixed state
jest.mock('../../controllers/auth.helpers', () => {
  const original = jest.requireActual('../../controllers/auth.helpers');
  return {
    ...original,
    generateRandomHex: jest.fn(() => 'mock-state'),
  };
});

// Mock getLocationFromIP to avoid external calls and speed up tests
jest.mock('../../utils/geo', () => ({
  getLocationFromIP: jest.fn().mockResolvedValue('Mock City, Mock Country'),
}));

// Re-import the app after mocks
const app = require('../../index');

describe('Google OAuth Flow', () => {
  const googleUserPayload = {
    sub: 'google12345',
    email: 'googleuser@example.com',
    email_verified: true,
    given_name: 'Google',
    family_name: 'User',
  };

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateAuthUrl.mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?mock');
    mockGetToken.mockResolvedValue({
      tokens: { id_token: 'mock-id-token', access_token: 'mock-access-token' },
    });
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => googleUserPayload,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  // ─── Redirect Endpoint ──────────────────────────────────────────────
  test('GET /api/auth/google - redirects to Google with state cookie', async () => {
    const res = await request(app).get('/api/auth/google');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/accounts\.google\.com/);
    const cookies = res.headers['set-cookie'];
    expect(cookies.some(c => c.startsWith('google_oauth_state='))).toBe(true);
  }, 10000);

  // ─── Callback - Success Cases ──────────────────────────────────────
  test('GET /api/auth/google/callback - new Google user creates account and redirects to profile', async () => {
    const agent = request.agent(app);
    await agent.get('/api/auth/google');

    const res = await agent
      .get('/api/auth/google/callback')
      .query({ state: 'mock-state', code: 'mock-code' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/profile\?oauth=success/);

    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND auth_provider = $2',
      [googleUserPayload.email, 'GOOGLE']
    );
    expect(user.rows.length).toBe(1);
    expect(user.rows[0].google_id).toBe(googleUserPayload.sub);
  }, 15000); // increased timeout

  test('GET /api/auth/google/callback - existing Google user logs in and redirects to profile', async () => {
    await pool.query(
      `INSERT INTO users (email, first_name, last_name, google_id, auth_provider, is_2fa_enabled)
       VALUES ($1, $2, $3, $4, 'GOOGLE', false)`,
      [googleUserPayload.email, googleUserPayload.given_name, googleUserPayload.family_name, googleUserPayload.sub]
    );

    const agent = request.agent(app);
    await agent.get('/api/auth/google');
    const res = await agent
      .get('/api/auth/google/callback')
      .query({ state: 'mock-state', code: 'mock-code' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/profile\?oauth=success/);
    const users = await pool.query('SELECT * FROM users WHERE email = $1', [googleUserPayload.email]);
    expect(users.rows.length).toBe(1);
  }, 10000);

  // ─── Callback - Error Cases ──────────────────────────────────────
  test('GET /api/auth/google/callback - missing state returns error redirect', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback')
      .query({ code: 'mock-code' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/login\?error=/);
  });

  test('GET /api/auth/google/callback - state mismatch returns error redirect', async () => {
    const agent = request.agent(app);
    await agent.get('/api/auth/google');
    const res = await agent
      .get('/api/auth/google/callback')
      .query({ state: 'wrong-state', code: 'mock-code' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/login\?error=/);
  });

  test('GET /api/auth/google/callback - email not verified returns error redirect', async () => {
    const unverifiedPayload = { ...googleUserPayload, email_verified: false };
    mockVerifyIdToken.mockResolvedValue({ getPayload: () => unverifiedPayload });

    const agent = request.agent(app);
    await agent.get('/api/auth/google');
    const res = await agent
      .get('/api/auth/google/callback')
      .query({ state: 'mock-state', code: 'mock-code' });

    expect(res.status).toBe(302);
    // Match the actual error message: "Your Google email is not verified..."
    expect(res.headers.location).toMatch(/\/login\?error=Your%20Google%20email/i);
  });

  test('GET /api/auth/google/callback - email already registered with LOCAL account returns error redirect', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')`,
      [googleUserPayload.email, hashed, 'Local', 'User']
    );

    const agent = request.agent(app);
    await agent.get('/api/auth/google');
    const res = await agent
      .get('/api/auth/google/callback')
      .query({ state: 'mock-state', code: 'mock-code' });

    expect(res.status).toBe(302);
    // Match the actual error: "This email is already registered with a password..."
    expect(res.headers.location).toMatch(/\/login\?error=This%20email%20is%20already%20registered/i);
  });

  test('GET /api/auth/google/callback - Google user with ADMIN role is blocked', async () => {
    const adminEmail = 'admin@example.com';
    const adminPayload = { ...googleUserPayload, email: adminEmail };
    mockVerifyIdToken.mockResolvedValue({ getPayload: () => adminPayload });

    // Insert an admin user with Google auth
    await pool.query(
      `INSERT INTO users (email, first_name, last_name, google_id, auth_provider, role, is_2fa_enabled)
       VALUES ($1, $2, $3, $4, 'GOOGLE', 'ADMIN', true)`,
      [adminEmail, adminPayload.given_name, adminPayload.family_name, adminPayload.sub]
    );

    // Optionally verify the role in DB (debug)
    const dbCheck = await pool.query('SELECT role FROM users WHERE email = $1', [adminEmail]);
    // console.log('DB role:', dbCheck.rows[0].role); // uncomment for debugging

    const agent = request.agent(app);
    await agent.get('/api/auth/google');
    const res = await agent
      .get('/api/auth/google/callback')
      .query({ state: 'mock-state', code: 'mock-code' });

    expect(res.status).toBe(302);
    // Match the actual error: "Google sign-in is not available for administrator accounts..."
    expect(res.headers.location).toMatch(/\/login\?error=Google%20sign-in%20is%20not%20available/i);
  });

  // ─── OAuth Device Handling ────────────────────────────────────────
  test('GET /api/auth/google/callback - new device creates device record and sets device_id cookie', async () => {
    const agent = request.agent(app);
    await agent.get('/api/auth/google');
    const res = await agent
      .get('/api/auth/google/callback')
      .query({ state: 'mock-state', code: 'mock-code' });

    expect(res.status).toBe(302);
    const cookies = res.headers['set-cookie'];
    expect(cookies.some(c => c.startsWith('device_id='))).toBe(true);

    const user = await pool.query('SELECT id FROM users WHERE email = $1', [googleUserPayload.email]);
    const device = await pool.query(
      'SELECT * FROM user_devices WHERE user_id = $1',
      [user.rows[0].id]
    );
    expect(device.rows.length).toBe(1);
  }, 10000);
});