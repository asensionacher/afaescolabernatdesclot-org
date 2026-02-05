#!/usr/bin/env node

/**
 * Password Hash Verification Tool
 * Tests if a password matches the stored hash
 * Updated to work with base64-encoded hashes
 */

const bcrypt = require('bcrypt');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(colors.cyan + 'Enter the password to verify: ' + colors.reset, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  log('\n' + '═'.repeat(70), 'magenta');
  log('🔍 PASSWORD HASH VERIFICATION TOOL', 'magenta');
  log('═'.repeat(70) + '\n', 'magenta');

  // Get hash from environment (base64-encoded)
  const hashBase64 = process.env.ACTAS_PASSWORD_HASH_BASE64;
  
  if (!hashBase64) {
    log('❌ Error: ACTAS_PASSWORD_HASH_BASE64 not found in .env.local', 'red');
    log('Run: ./scripts/generate-security-credentials.sh "YourPassword"', 'yellow');
    process.exit(1);
  }

  // Decode from base64
  const hash = Buffer.from(hashBase64, 'base64').toString('utf-8');
  
  log('📋 Current hash in .env.local:', 'blue');
  log(`   Base64: ${hashBase64}`, 'yellow');
  log(`   Decoded: ${hash}`, 'cyan');
  log('', 'reset');

  // Get password to test
  let password = process.argv[2];
  
  if (!password) {
    password = await promptPassword();
  }

  if (!password || password.trim() === '') {
    log('\n❌ Error: Password cannot be empty', 'red');
    process.exit(1);
  }

  log('\n🔄 Verifying password...', 'cyan');
  log(`   Password: ${password}`, 'yellow');
  log(`   Length: ${password.length} characters`, 'yellow');
  
  try {
    const isMatch = await bcrypt.compare(password, hash);
    
    log('', 'reset');
    log('═'.repeat(70), 'blue');
    log('📊 VERIFICATION RESULT', 'blue');
    log('═'.repeat(70), 'blue');
    log('', 'reset');

    if (isMatch) {
      log('✅ PASSWORD MATCHES! ✅', 'green');
      log('', 'reset');
      log('The password is correct and will work for login.', 'green');
    } else {
      log('❌ PASSWORD DOES NOT MATCH ❌', 'red');
      log('', 'reset');
      log('The password you entered does NOT match the stored hash.', 'red');
      log('', 'reset');
      log('Possible reasons:', 'yellow');
      log('  1. Incorrect password', 'yellow');
      log('  2. Extra spaces at the beginning or end', 'yellow');
      log('  3. Wrong capitalization', 'yellow');
      log('  4. Hash was generated for a different password', 'yellow');
      log('', 'reset');
      log('To fix:', 'cyan');
      log('  1. Regenerate hash with correct password:', 'cyan');
      log('     ./scripts/generate-security-credentials.sh "YourCorrectPassword"', 'cyan');
      log('  2. Copy the new ACTAS_PASSWORD_HASH_BASE64 to .env.local', 'cyan');
      log('  3. Restart server: pnpm dev', 'cyan');
    }

    log('', 'reset');
    log('═'.repeat(70), 'blue');
    log('', 'reset');

    // Show bcrypt details
    log('🔐 BCRYPT DETAILS:', 'magenta');
    const parts = hash.split('$');
    if (parts.length >= 4) {
      log(`   Algorithm: bcrypt`, 'cyan');
      log(`   Cost factor: ${parts[2]} rounds (${Math.pow(2, parseInt(parts[2]))} iterations)`, 'cyan');
      log(`   Salt: ${parts[3].substring(0, 22)}`, 'cyan');
    }
    
    log('', 'reset');

  } catch (error) {
    log('\n❌ Error during verification:', 'red');
    log(`   ${error.message}`, 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
