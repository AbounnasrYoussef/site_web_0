const pool = require('../db');
const getLocale = require('../utils/locale');

async function getCities(req, res, next) {
  try {
    const locale = getLocale(req);
    const query = `
      SELECT ct.region,
            json_agg(json_build_object('id', c.id, 'name', ct.name) ORDER BY ct.name) AS cities
      FROM cities c
      LEFT JOIN city_translations ct ON ct.city_id = c.id AND ct.locale = $1
      GROUP BY ct.region
      ORDER BY ct.region;
    `;
    const result = await pool.query(query, [locale.toUpperCase()]);
    return res.json({ cities: result.rows });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCities };