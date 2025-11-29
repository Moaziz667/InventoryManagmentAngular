const bcrypt = require('bcryptjs');

// Run this to generate a hashed password for the default admin user
async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

generateHash();
