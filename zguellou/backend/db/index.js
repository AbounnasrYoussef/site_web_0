const { Pool } = require('pg');
const path = require('path');

let envPath;
if (process.env.NODE_ENV === 'test') {
  envPath = path.join(__dirname, '..', '.env.test');
} else {
  envPath = path.join(__dirname, '..', '..', '.env');
}
require('dotenv').config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err.stack);
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

module.exports = pool;

