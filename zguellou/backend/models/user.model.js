const pool = require('../db');

async function findByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return result.rows[0] || null;
}


async function findById(id) {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, role, profile_pic, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function createUser({ first_name, last_name, email, password_hash, role = 'USER' }) {
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_name, last_name, email, role, profile_pic, created_at`,
    [first_name, last_name, email, password_hash, role]
  );
  return result.rows[0];
}

async function updateUser(id, updates) {
  const allowedFields = ['first_name', 'last_name', 'profile_pic', 'school_level', 'filiere_id', 'degree', 'bac_year', 'bac_grade'];
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = $${idx}`);
      values.push(updates[field]);
      idx++;
    }
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE users
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, first_name, last_name, email, role, profile_pic, created_at
  `;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUser
};