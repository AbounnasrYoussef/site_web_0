const path = require('path');
// let envPath;
// if (process.env.NODE_ENV === 'test') {
//   envPath = path.join(__dirname, '..', '.env.test');
// } else {
//   envPath = path.join(__dirname, '.env.global'); //'..', 
// }
require('dotenv');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { getMessage } = require('./errors/messages');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const categoriesController = require('./controllers/categories.controller');
const citiesController = require('./controllers/cities.controller');
const diplomatController = require('./controllers/diplomat.controller');

const app = express();
const PORT = process.env.AUTH_BACKEND_PORT || 5000;

// if (process.env.TRUST_PROXY) 
//   app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// app.use('/api/images', express.static(path.join(__dirname, 'public', 'images')));

morgan.token('body', (req) => {
  if (!req.body || req.method === 'GET') return '-';
  const safe = { ...req.body };
  delete safe.password;
  delete safe.password_hash;
  delete safe.token;
  delete safe.accessToken;
  delete safe.pending_token;
  delete safe.refresh_token;
  return JSON.stringify(safe);
});
morgan.token('request-id', (req) => req.requestId || '-');
const stream = {
  write: (message) => logger.info(message.trim()),
};
morgan.token('url-redacted', (req) => {
  const url = req.originalUrl || req.url; // Remove token=... from query string
  return url.replace(/([?&])token=[^&]+/g, '$1token=[REDACTED]');
});

app.use(morgan(':request-id :method :url-redacted :status :response-time ms - :remote-addr  :body', { stream }));

const requestId = require('./middleware/requestId');
const getLocale = require('./utils/locale');
app.use(requestId);

// Prevent caching of all API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Vary', 'Authorization, Origin');
  next();
});

// routes
app.use('/api/auth', authRoutes);

// hado khashom it7eto 3nd youssef
app.get('/api/categories', categoriesController.getCategories);
app.get('/api/cities', citiesController.getCities);
app.get('/api/diplomas', diplomatController.getDiplomas);
app.get('/api/diplomas/:id/fields', diplomatController.getDiplomaFields);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  logger.error(err.stack, {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
  });
  const locale = getLocale(req);
  const message = getMessage('internal_error', locale);
  const response = { error: message };
  if (err.sendValid) {
    response.valid = false;
  }

  res.status(500).json(response);
});

if (require.main === module) { // 3la wdit tests because kaydi lport 5000
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app; // testing