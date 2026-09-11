
function getLocale(req) {
  return req.cookies?.locale || req.query?.locale || 'en';
}

module.exports = getLocale;