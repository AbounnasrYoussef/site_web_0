const pool = require("../db");
const { getMessage } = require("../errors/messages");
const getLocale = require("../utils/locale");

async function getDiplomas(req, res, next) {
  try {
    const locale = getLocale(req);
    const result = await pool.query(
      `SELECT d.id, d.rank, COALESCE(dt.name, d.code) AS name
       FROM diplomas d
       LEFT JOIN diploma_translations dt ON dt.diploma_id = d.id AND dt.locale = $1
       ORDER BY d.rank, COALESCE(dt.name, d.code)`,
      [locale.toUpperCase()]
    );
    return res.json({ diplomas: result.rows });
  } catch (error) {
    next(error);
  }
}

async function getDiplomaFields(req, res, next) {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ 
        error: getMessage('validation/invalid_uuid', locale) 
      });
    }

    const result = await pool.query(
      `SELECT f.id, COALESCE(ft.name, f.id::text) AS name
       FROM diploma_fields df
       JOIN fields f ON f.id = df.field_id
       LEFT JOIN field_translations ft ON ft.field_id = f.id AND ft.locale = $2
       WHERE df.diploma_id = $1
       ORDER BY name`,
      [id, locale.toUpperCase()]
    );

    return res.json({ fields: result.rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDiplomas,
  getDiplomaFields,
};