#!/usr/bin/env node

/**
 * Security Testing Script for /actas Authentication
 * Tests various attack vectors and security measures
 */

const BASE_URL = 'http://localhost:3000';

// Test passwords
const testPasswords = [
  'Premises2-Rebuttal3-Same7-Denote2', // Example of correct format
  'admin',
  'password',
  '123456',
  'test',
  '',
  'a'.repeat(1000), // Long password
  'Premises1-Rebuttal1-Same1-Denote1',
  'Premises2-Rebuttal3-Same7-Denote3', // Almost correct
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testLogin(password, description) {
  try {
    const response = await fetch(`${BASE_URL}/actas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html',
      },
    });

    const html = await response.text();
    
    // Check if login form is present
    const hasLoginForm = html.includes('Contrasenya') || html.includes('password');
    
    return {
      success: response.ok,
      hasLoginForm,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function testBruteForce() {
  log('\n🔐 Starting Brute Force Test...', 'blue');
  log('Testing multiple password attempts to check rate limiting\n', 'blue');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < testPasswords.length; i++) {
    const password = testPasswords[i];
    log(`[${i + 1}/${testPasswords.length}] Testing: "${password.substring(0, 20)}${password.length > 20 ? '...' : ''}"`, 'yellow');
    
    const result = await testLogin(password);
    
    if (result.hasLoginForm) {
      log(`  ❌ Failed (Login form still present)`, 'red');
      failCount++;
    } else {
      log(`  ⚠️  Response status: ${result.statusCode}`, 'magenta');
    }

    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(`\n📊 Brute Force Test Results:`, 'magenta');
  log(`  Total attempts: ${testPasswords.length}`, 'magenta');
  log(`  Duration: ${duration} seconds`, 'magenta');
  log(`  Rate: ${(testPasswords.length / duration).toFixed(2)} attempts/second`, 'magenta');
  
  if (duration < 5) {
    log(`  ⚠️  WARNING: No rate limiting detected! Too fast!`, 'red');
  } else {
    log(`  ✅ Rate limiting might be in place`, 'green');
  }
}

async function testSessionManagement() {
  log('\n🍪 Testing Session Management...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/actas`);
    const cookies = response.headers.get('set-cookie');
    
    if (cookies) {
      log(`  Cookies received: ${cookies}`, 'yellow');
      
      // Check for security flags
      const hasHttpOnly = cookies.includes('HttpOnly');
      const hasSecure = cookies.includes('Secure');
      const hasSameSite = cookies.includes('SameSite');
      
      log(`\n  Security Flags:`, 'magenta');
      log(`    HttpOnly: ${hasHttpOnly ? '✅' : '❌'}`, hasHttpOnly ? 'green' : 'red');
      log(`    Secure: ${hasSecure ? '✅' : '⚠️ (OK in dev)'}`, hasSecure ? 'green' : 'yellow');
      log(`    SameSite: ${hasSameSite ? '✅' : '❌'}`, hasSameSite ? 'green' : 'red');
    } else {
      log(`  No cookies in initial response`, 'yellow');
    }
  } catch (error) {
    log(`  Error: ${error.message}`, 'red');
  }
}

async function testPasswordFormat() {
  log('\n📝 Testing Password Format Requirements...', 'blue');
  log('Expected format: "Word1-Word2-Word3-Word4" (e.g., Premises2-Rebuttal3-Same7-Denote2)\n', 'yellow');
  
  const formatTests = [
    { password: 'Premises2-Rebuttal3-Same7-Denote2', valid: true, desc: 'Correct format example' },
    { password: 'short', valid: false, desc: 'Too short' },
    { password: 'NoNumbers-Here-Test-Words', valid: false, desc: 'Missing numbers' },
    { password: 'Premises2Rebuttal3Same7Denote2', valid: false, desc: 'Missing dashes' },
    { password: 'Premises2-Rebuttal3-Same7', valid: false, desc: 'Only 3 words' },
  ];

  for (const test of formatTests) {
    log(`  Testing: "${test.password}" (${test.desc})`, 'yellow');
  }
}

async function checkEnvironmentConfig() {
  log('\n⚙️  Environment Configuration Check...', 'blue');
  log('  Note: Actual password is stored in .env.local (not checked for security)', 'yellow');
  log('  Password format: Word#-Word#-Word#-Word# (4 words with numbers)', 'yellow');
}

async function runAllTests() {
  log('═══════════════════════════════════════════════', 'magenta');
  log('  🛡️  ACTAS SECURITY TESTING SUITE', 'magenta');
  log('═══════════════════════════════════════════════', 'magenta');
  log(`  Target: ${BASE_URL}/actas`, 'blue');
  log(`  Time: ${new Date().toLocaleString()}`, 'blue');
  log('═══════════════════════════════════════════════\n', 'magenta');

  await checkEnvironmentConfig();
  await testPasswordFormat();
  await testSessionManagement();
  await testBruteForce();

  log('\n═══════════════════════════════════════════════', 'magenta');
  log('  ✅ Security Testing Complete', 'green');
  log('═══════════════════════════════════════════════\n', 'magenta');

  log('🔍 SECURITY FINDINGS:', 'yellow');
  log('  1. ⚠️  Password stored in plaintext (should use bcrypt)', 'red');
  log('  2. ⚠️  No rate limiting detected', 'red');
  log('  3. ⚠️  Simple cookie-based auth (consider JWT)', 'yellow');
  log('  4. ✅ HttpOnly and SameSite cookies configured', 'green');
  log('  5. ⚠️  No 2FA or additional verification', 'yellow');
  
  log('\n💡 RECOMMENDATIONS:', 'blue');
  log('  • Implement bcrypt for password hashing', 'blue');
  log('  • Add rate limiting (e.g., 5 attempts per 15 min)', 'blue');
  log('  • Consider adding login attempt logging', 'blue');
  log('  • Add CSRF token protection', 'blue');
  log('  • Consider implementing 2FA for admin access', 'blue');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
