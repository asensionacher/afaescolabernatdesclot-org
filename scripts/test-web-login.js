#!/usr/bin/env node

/**
 * Web Login Simulator
 * Tests the actual login flow as it happens in the browser
 */

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

async function testWebLogin(password) {
  log('\n' + '═'.repeat(70), 'magenta');
  log('🌐 WEB LOGIN SIMULATOR', 'magenta');
  log('═'.repeat(70) + '\n', 'magenta');

  log(`Testing password: ${password}`, 'cyan');
  log(`Password length: ${password.length} characters`, 'cyan');
  log('', 'reset');

  // Test 1: Direct bcrypt verification (like verify-password.js)
  log('Test 1: Direct bcrypt verification', 'blue');
  try {
    const bcrypt = require('bcrypt');
    const dotenv = require('fs').readFileSync('.env.local', 'utf8');
    const hashMatch = dotenv.match(/ACTAS_PASSWORD_HASH=(.+)/);
    
    if (!hashMatch) {
      log('❌ ACTAS_PASSWORD_HASH not found in .env.local', 'red');
      return;
    }

    const storedHash = hashMatch[1].trim();
    log(`Hash: ${storedHash}`, 'yellow');
    
    const directMatch = await bcrypt.compare(password, storedHash);
    log(`Result: ${directMatch ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`, directMatch ? 'green' : 'red');
    log('', 'reset');

    // Test 2: Simulate auth.ts verifyPassword function
    log('Test 2: Simulating auth.ts verifyPassword()', 'blue');
    
    // Load environment variables like Next.js does
    require('dotenv').config({ path: '.env.local' });
    
    const envHash = process.env.ACTAS_PASSWORD_HASH;
    log(`process.env.ACTAS_PASSWORD_HASH: ${envHash ? 'Found' : 'NOT FOUND'}`, envHash ? 'green' : 'red');
    
    if (envHash) {
      log(`Hash value: ${envHash}`, 'yellow');
      const authMatch = await bcrypt.compare(password, envHash);
      log(`Result: ${authMatch ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`, authMatch ? 'green' : 'red');
    }
    log('', 'reset');

    // Test 3: Check for invisible characters
    log('Test 3: Checking for invisible characters', 'blue');
    const bytes = Buffer.from(password);
    log(`Byte representation: ${bytes.toString('hex')}`, 'yellow');
    
    const hasInvisible = password !== password.trim();
    log(`Has leading/trailing spaces: ${hasInvisible ? '⚠️ YES' : '✅ NO'}`, hasInvisible ? 'yellow' : 'green');
    log('', 'reset');

    // Test 4: Character by character analysis
    log('Test 4: Character analysis', 'blue');
    log(`Characters: [${password.split('').join('][')}]`, 'yellow');
    log('', 'reset');

    // Summary
    log('═'.repeat(70), 'magenta');
    log('📊 SUMMARY', 'magenta');
    log('═'.repeat(70), 'magenta');
    log('', 'reset');

    if (directMatch && authMatch) {
      log('✅ Both tests PASSED - Password should work in web', 'green');
      log('', 'reset');
      log('If web still fails, possible causes:', 'yellow');
      log('  1. Server not restarted after .env.local change', 'yellow');
      log('  2. Browser caching old assets', 'yellow');
      log('  3. Different password being entered in browser', 'yellow');
      log('  4. Copy-paste adding invisible characters', 'yellow');
    } else {
      log('❌ Tests FAILED - Password will NOT work in web', 'red');
      log('', 'reset');
      log('Action required:', 'yellow');
      log('  1. Regenerate hash: ./scripts/generate-security-credentials.sh "YourPassword"', 'yellow');
      log('  2. Update .env.local', 'yellow');
      log('  3. Restart server: pnpm dev', 'yellow');
    }
    log('', 'reset');

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

const password = process.argv[2] || 'Wildness4-Chop8-Stung1-Theme0';
testWebLogin(password).catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
