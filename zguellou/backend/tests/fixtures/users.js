const bcrypt = require('bcrypt');

const VALID_PASSWORD = 'ValidPass123!';

module.exports = {
  validUser: {
    email: 'test@example.com',
    password: VALID_PASSWORD,
    first_name: 'Test',
    last_name: 'User',
  },
  weakPasswordUser: {
    email: 'weak@example.com',
    password: '123',
    first_name: 'Weak',
    last_name: 'Pass',
  },
  noSpecialCharUser: {
    email: 'nospecial@example.com',
    password: 'Password123',
    first_name: 'No',
    last_name: 'Special',
  },
};