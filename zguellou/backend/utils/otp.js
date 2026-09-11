const crypto = require('crypto');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function verifyOTP(otp, hash) {
  const hashInput = hashOTP(otp);
  // An attacker can try thousands of OTPs and measure how long the server takes to respond. If it takes 1ms longer for a code starting with 1234xx versus 9999xx, the attacker knows they are on the right track. This is called a timing side‑channel attack.
  return crypto.timingSafeEqual( 
    Buffer.from(hashInput, 'utf8'),
    Buffer.from(hash, 'utf8')
  );
}

module.exports = { generateOTP, hashOTP, verifyOTP };