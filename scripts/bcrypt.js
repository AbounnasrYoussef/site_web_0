const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'adminpassword';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(hash);
}

hashPassword();