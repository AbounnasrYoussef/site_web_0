const pool = require('../../db');
const bcrypt = require('bcrypt');
const { validUser } = require('../fixtures/users');

// Helper: insert test category with translation
async function insertTestCategory(slug, nameEn, nameFr, nameAr) {
  const catResult = await pool.query(
    `INSERT INTO categories (name) VALUES ($1) RETURNING id`,
    [name]
  );
  const catId = catResult.rows[0].id;
  await pool.query(
    `INSERT INTO category_translations (category_id, locale, name) VALUES
      ($1, 'EN', $2),
      ($1, 'FR', $3),
      ($1, 'AR', $4)`,
    [catId, nameEn, nameFr, nameAr]
  );
  return catId;
}

// Helper: insert test city with translation
async function insertTestCity(nameEn, nameFr, nameAr, regionEn, regionFr, regionAr) {
  const cityResult = await pool.query(
    `INSERT INTO cities DEFAULT VALUES RETURNING id`
  );
  const cityId = cityResult.rows[0].id;
  await pool.query(
    `INSERT INTO city_translations (city_id, locale, name, region) VALUES
      ($1, 'EN', $2, $5),
      ($1, 'FR', $3, $6),
      ($1, 'AR', $4, $7)`,
    [cityId, nameEn, nameFr, nameAr, regionEn, regionFr, regionAr]
  );
  return cityId;
}

describe('Profile endpoints (GET & PATCH)', () => {
  let app;
  let request;
  let authToken;
  let testUserId;
  let categoryId1, categoryId2;
  let cityId1, cityId2;

  beforeAll(async () => {
    jest.resetModules();
    app = require('../../index');
    request = require('supertest');

    // Insert test categories and cities
    categoryId1 = await insertTestCategory('science', 'Science', 'Sciences', 'علوم');
    categoryId2 = await insertTestCategory('arts', 'Arts', 'Arts', 'فنون');
    cityId1 = await insertTestCity('Casablanca', 'Casablanca', 'الدار البيضاء', 'Casablanca-Settat', 'Casablanca-Settat', 'الدار البيضاء-سطات');
    cityId2 = await insertTestCity('Rabat', 'Rabat', 'الرباط', 'Rabat-Salé-Kénitra', 'Rabat-Salé-Kénitra', 'الرباط-سلا-القنيطرة');
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM user_interested_categories');
    await pool.query('DELETE FROM user_interested_cities');
    await pool.query('DELETE FROM users WHERE email = $1', [validUser.email]);
    await pool.query('DELETE FROM categories');
    await pool.query('DELETE FROM cities');
    await pool.end();
  });

  beforeEach(async () => {
    // Create test user
    const hashed = await bcrypt.hash(validUser.password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, auth_provider)
       VALUES ($1, $2, $3, $4, 'LOCAL')
       RETURNING id`,
      [validUser.email, hashed, validUser.first_name, validUser.last_name]
    );
    testUserId = result.rows[0].id;

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    authToken = loginRes.body.accessToken;
  });

  afterEach(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [validUser.email]);
  });

  // ---------- GET /profile ----------
  test('GET /profile - unauthenticated returns 401', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /profile - authenticated returns user profile with empty interests', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      email: validUser.email,
      first_name: validUser.first_name,
      last_name: validUser.last_name,
      role: 'USER',
    });
    expect(res.body.user.interested_category_ids).toEqual([]);
  });

  // ---------- PATCH /profile ----------
  test('PATCH /profile - unauthenticated returns 401', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .send({ first_name: 'New' });
    expect(res.status).toBe(401);
  });

  test('PATCH /profile - empty body returns 400', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/No fields to update|Aucun champ|لا توجد حقول/i);
  });

  test('PATCH /profile - update first_name only', async () => {
    const newName = 'UpdatedFirstName';
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ first_name: newName });
    expect(res.status).toBe(200);
    expect(res.body.user.first_name).toBe(newName);
    // Ensure interests remain empty
    expect(res.body.user.interested_category_ids).toEqual([]);
  });

  test('PATCH /profile - update all allowed fields including interests', async () => {
    const payload = {
      first_name: 'TestFirst',
      last_name: 'TestLast',
      year_of_birth: 2000,
      filiere_id: '10000000-0000-0000-0000-000000000003',
      degree: 'BAC',
      bac_year: 2022,
      regional_note: '14.50',
      national_note: '16.00',
      controle_continue_note: '15.00',
      bac_grade: '15.80',
      is_dropout: false,
      profile_pic: 'https://example.com/avatar.jpg',
      interested_category_ids: [categoryId1, categoryId2],
    };

    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      first_name: payload.first_name,
      last_name: payload.last_name,
      year_of_birth: payload.year_of_birth,
      filiere_id: payload.filiere_id,
      degree: payload.degree,
      bac_year: payload.bac_year,
      regional_note: payload.regional_note,
      national_note: payload.national_note,
      controle_continue_note: payload.controle_continue_note,
      bac_grade: payload.bac_grade,
      is_dropout: payload.is_dropout,
      profile_pic: payload.profile_pic,
    });
    expect(res.body.user.interested_category_ids).toEqual(expect.arrayContaining([categoryId1, categoryId2]));
  });

  test('PATCH /profile - update only interests (replace all)', async () => {
    // First set some interests
    await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        interested_category_ids: [categoryId1],
      });

    // Now replace with new set (only categoryId2 and cityId2)
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        interested_category_ids: [categoryId2],
      });

    expect(res.status).toBe(200);
    expect(res.body.user.interested_category_ids).toEqual([categoryId2]);
  });

  test('PATCH /profile - invalid UUID in interests returns 400', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        interested_category_ids: ['not-a-uuid'],
      });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].field).toBe('interested_category_ids');
  });

  test('PATCH /profile - invalid bac_year (string) returns 400', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bac_year: 'not-a-number',
      });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].field).toBe('bac_year');
  });

  // ---------- GET /categories ----------
  test('GET /categories - returns list with translations', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Cookie', 'locale=en'); // or use query param
    expect(res.status).toBe(200);
    expect(res.body.categories).toBeInstanceOf(Array);
    expect(res.body.categories[0]).toHaveProperty('id');
    expect(res.body.categories[0]).toHaveProperty('name');
  });

  // ---------- GET /cities ----------
  test('GET /cities - returns list with translations', async () => {
    const res = await request(app)
      .get('/api/cities')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Cookie', 'locale=en');
    expect(res.status).toBe(200);
    expect(res.body.cities).toBeInstanceOf(Array);
    expect(res.body.cities[0]).toHaveProperty('id');
    expect(res.body.cities[0]).toHaveProperty('name');
    expect(res.body.cities[0]).toHaveProperty('region');
  });
});