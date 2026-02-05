/**
 * Direct test of bcrypt verification
 * Tests if the password matches the hash WITHOUT the Next.js server
 */

const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

const password = 'Wildness4-Chop8-Stung1-Theme0';
const hash = process.env.ACTAS_PASSWORD_HASH;

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 DIRECT BCRYPT TEST (bypassing Next.js)');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📋 Environment Check:');
console.log('   JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('   ACTAS_PASSWORD_HASH present:', !!process.env.ACTAS_PASSWORD_HASH);
console.log('   Hash value:', hash?.substring(0, 30) + '...\n');

console.log('🔐 Testing Password:');
console.log('   Password:', password);
console.log('   Length:', password.length);
console.log('   Hex:', Buffer.from(password).toString('hex'), '\n');

console.log('⏳ Running bcrypt.compare...\n');

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('❌ ERROR:', err);
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════════');
  if (result) {
    console.log('✅ PASSWORD MATCHES! ✅');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✅ The password is CORRECT.');
    console.log('✅ If login still fails, the problem is in Next.js server.');
    process.exit(0);
  } else {
    console.log('❌ PASSWORD DOES NOT MATCH! ❌');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n❌ The password is WRONG.');
    console.log('❌ You need to regenerate credentials.');
    process.exit(1);
  }
});
