const crypto = require('crypto');

module.exports = (req, res, next) => {
  req.requestId = crypto.randomUUID().slice(0, 8);
  next();
};