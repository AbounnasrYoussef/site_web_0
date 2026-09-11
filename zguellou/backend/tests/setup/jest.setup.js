const pool = require('../../db');

jest.setTimeout(30000);

beforeEach(async () => {
  await pool.query(`
    TRUNCATE
      users,
      refresh_tokens,
      user_devices,
      user_interested_categories,
      blacklisted_tokens,
      password_reset_tokens
    RESTART IDENTITY CASCADE
  `);
});

afterAll(async () => {
  if (pool._clients && pool._clients.length > 0) {
    await pool.end();
  }
});
