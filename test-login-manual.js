#!/usr/bin/env node

/**
 * Manual Login Testing Script
 * Interactive tool to test the /actas login functionality
 */

const readline = require('readline');

const BASE_URL = 'http://localhost:3000';

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

async function testLoginWithPassword(password) {
  log('\n🔄 Attempting login...', 'cyan');
  
  try {
    // First, get the page to check initial state
    const initialResponse = await fetch(`${BASE_URL}/actas`, {
      method: 'GET',
      credentials: 'include',
    });
    
    log(`Initial page status: ${initialResponse.status}`, 'yellow');
    
    // Now try to login via the server action
    // Note: This is a simplified test - actual login happens client-side
    const html = await initialResponse.text();
    
    if (html.includes('Contrasenya') || html.includes('password')) {
      log('✅ Login page is accessible', 'green');
      log('📝 Login form detected', 'green');
      
      log('\n🔍 Page analysis:', 'blue');
      log(`  - Contains login form: YES`, 'green');
      log(`  - Password field present: ${html.includes('type="password"') ? 'YES' : 'NO'}`, 'green');
      log(`  - Submit button present: ${html.includes('Accedir') ? 'YES' : 'NO'}`, 'green');
      
      return {
        success: false,
        message: 'Login form is present. Password needs to be tested via browser.',
        requiresBrowser: true,
      };
    } else if (html.includes('Actes de Reunió') && !html.includes('Contrasenya')) {
      log('🎉 Already authenticated!', 'green');
      return {
        success: true,
        message: 'Already logged in',
      };
    } else {
      log('⚠️  Unexpected page state', 'yellow');
      return {
        success: false,
        message: 'Unexpected response',
      };
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
    };
  }
}

async function checkAuthStatus() {
  log('\n🔍 Checking authentication status...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/actas`, {
      credentials: 'include',
    });
    
    const html = await response.text();
    const isLoggedIn = !html.includes('Contrasenya') && html.includes('Actes de Reunió');
    
    if (isLoggedIn) {
      log('✅ Currently authenticated', 'green');
    } else {
      log('❌ Not authenticated', 'red');
    }
    
    return isLoggedIn;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

async function getBrowserInstructions() {
  log('\n' + '═'.repeat(60), 'magenta');
  log('📱 MANUAL BROWSER TESTING INSTRUCTIONS', 'magenta');
  log('═'.repeat(60), 'magenta');
  
  log('\n1️⃣  Open your browser and go to:', 'cyan');
  log(`   ${BASE_URL}/actas`, 'blue');
  
  log('\n2️⃣  You should see a login form with:', 'cyan');
  log('   • Title: "Actes de Reunió"', 'yellow');
  log('   • Subtitle: "Introdueix la contrasenya per accedir"', 'yellow');
  log('   • Password input field', 'yellow');
  log('   • "Accedir" button', 'yellow');
  
  log('\n3️⃣  Enter the password:', 'cyan');
  log('   Format: Word#-Word#-Word#-Word#', 'yellow');
  log('   Example: Premises2-Rebuttal3-Same7-Denote2', 'yellow');
  
  log('\n4️⃣  Expected behaviors:', 'cyan');
  log('   ✅ Correct password: Page reloads, shows meeting reports list', 'green');
  log('   ❌ Wrong password: Error message "Contrasenya incorrecta"', 'red');
  log('   ⏳ Loading state: Button shows "Verificant..."', 'yellow');
  
  log('\n5️⃣  Security observations to make:', 'cyan');
  log('   • Check browser DevTools > Application > Cookies', 'yellow');
  log('   • Look for "actas_auth" cookie with HttpOnly flag', 'yellow');
  log('   • Try multiple wrong passwords quickly (test rate limiting)', 'yellow');
  log('   • Check Network tab for login request/response', 'yellow');
  
  log('\n6️⃣  Session management:', 'cyan');
  log('   • Session expires after 24 hours', 'yellow');
  log('   • Cookie path: /', 'yellow');
  log('   • SameSite: lax', 'yellow');
  
  log('\n' + '═'.repeat(60) + '\n', 'magenta');
}

async function generateTestPasswords() {
  log('\n🔐 COMMON PASSWORD PATTERNS TO TEST (for security)', 'cyan');
  log('═'.repeat(60), 'magenta');
  
  const patterns = [
    'admin',
    'password',
    '123456',
    'actas',
    'ampa',
    'bernatdesclot',
    'Premises2-Rebuttal3-Same7-Denote2', // Example correct format
    'Test1-Password2-Format3-Here4',
    'Word1-Word2-Word3-Word4',
  ];
  
  log('\n❌ These should FAIL (security test):', 'red');
  patterns.slice(0, -3).forEach(p => log(`   • ${p}`, 'yellow'));
  
  log('\n✅ These follow the correct format:', 'green');
  patterns.slice(-3).forEach(p => log(`   • ${p}`, 'yellow'));
  
  log('\n⚠️  Remember: The actual password is in .env.local', 'magenta');
  log('═'.repeat(60) + '\n', 'magenta');
}

async function main() {
  log('\n' + '═'.repeat(60), 'magenta');
  log('🧪 ACTAS LOGIN TESTING TOOL', 'magenta');
  log('═'.repeat(60), 'magenta');
  
  log(`\n📍 Target URL: ${BASE_URL}/actas`, 'blue');
  log(`⏰ Time: ${new Date().toLocaleString()}\n`, 'blue');
  
  // Check if server is running
  try {
    const response = await fetch(`${BASE_URL}/actas`);
    log('✅ Server is running', 'green');
  } catch (error) {
    log('❌ Server is not running!', 'red');
    log('   Run: pnpm dev', 'yellow');
    process.exit(1);
  }
  
  // Check current auth status
  await checkAuthStatus();
  
  // Show browser testing instructions
  await getBrowserInstructions();
  
  // Generate test passwords
  await generateTestPasswords();
  
  // Offer to open browser
  log('💡 TIP: To test automatically, you can:', 'cyan');
  log('   1. Open http://localhost:3000/actas in your browser', 'yellow');
  log('   2. Open DevTools (F12)', 'yellow');
  log('   3. Go to Console tab', 'yellow');
  log('   4. Test the login function manually\n', 'yellow');
  
  log('📊 CURRENT SECURITY STATUS:', 'magenta');
  log('   ⚠️  Password comparison: Plaintext (VULNERABLE)', 'red');
  log('   ⚠️  Rate limiting: None (VULNERABLE to brute force)', 'red');
  log('   ✅ Cookie security: HttpOnly + SameSite', 'green');
  log('   ⚠️  Session token: Simple string (consider JWT)', 'yellow');
  log('   ⚠️  CSRF protection: Basic (SameSite only)', 'yellow');
  log('   ⚠️  Logging: No audit trail', 'red');
  
  log('\n✨ Next steps:', 'cyan');
  log('   1. Test login in browser with real password', 'yellow');
  log('   2. Implement security improvements (bcrypt, rate limiting)', 'yellow');
  log('   3. Add logging for failed attempts', 'yellow');
  log('   4. Consider adding 2FA\n', 'yellow');
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
