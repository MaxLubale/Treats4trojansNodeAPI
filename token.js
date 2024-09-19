const crypto = require('crypto');

// Generate a random token
const token = crypto.randomBytes(32).toString('hex');

console.log('Generated Token:', token);
