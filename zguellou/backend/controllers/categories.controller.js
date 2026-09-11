const pool = require('../db');
const getLocale = require('../utils/locale');

async function getCategories(req, res, next) {
  try {
    const locale = getLocale(req);
    const query = `
      SELECT c.id, c.name, ct.name as translation_name
      FROM categories c
      LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $1
      ORDER BY ct.name ASC
    `;
    const result = await pool.query(query, [locale.toUpperCase()]);
    return res.json({ categories: result.rows });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCategories };