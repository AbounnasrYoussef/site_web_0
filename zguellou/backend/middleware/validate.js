const { validationResult } = require('express-validator');
const { getMessage } = require('../errors/messages');
const getLocale = require('../utils/locale');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) 
    return next();

  const locale = getLocale(req);
  
  const seenFields = new Set();
  const errorMessages = [];

  for (const err of errors.array()) {
    const field = err.path;
    if (seenFields.has(field)) 
      continue;
    seenFields.add(field);

    const message = getMessage(err.msg, locale) || err.msg;
    errorMessages.push({ field, message });
  }

  return res.status(400).json({ errors: errorMessages });
}

module.exports = validate;