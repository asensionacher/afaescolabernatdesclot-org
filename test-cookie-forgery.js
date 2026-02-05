#!/usr/bin/env node

/**
 * Cookie Forgery Test
 * Tests if manually creating a cookie can bypass authentication
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

async function testCookieForgery() {
  const BASE_URL = 'http://localhost:3000';
  
  log('\n' + '═'.repeat(60), 'magenta');
  log('🍪 COOKIE FORGERY VULNERABILITY TEST', 'magenta');
  log('═'.repeat(60), 'magenta');
  
  log('\n🎯 VULNERABILITY: Manual Cookie Creation', 'red');
  log('Testing if we can bypass auth by manually setting cookie...\n', 'yellow');
  
  // Test 1: Without cookie
  log('Test 1: Access without cookie', 'cyan');
  try {
    const response1 = await fetch(`${BASE_URL}/actas`);
    const html1 = await response1.text();
    const hasLoginForm1 = html1.includes('Contrasenya');
    
    log(`  Status: ${response1.status}`, 'yellow');
    log(`  Has login form: ${hasLoginForm1 ? 'YES' : 'NO'}`, hasLoginForm1 ? 'green' : 'red');
    log(`  Result: ${hasLoginForm1 ? '✅ Blocked (login required)' : '❌ Accessible'}`, hasLoginForm1 ? 'green' : 'red');
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
  }
  
  // Test 2: With forged cookie
  log('\nTest 2: Access with FORGED cookie (actas_auth=authenticated)', 'cyan');
  try {
    const response2 = await fetch(`${BASE_URL}/actas`, {
      headers: {
        'Cookie': 'actas_auth=authenticated'
      }
    });
    const html2 = await response2.text();
    const hasLoginForm2 = html2.includes('Contrasenya');
    const hasContent = html2.includes('Actes de Reunió') || html2.includes('MeetingReportsList');
    
    log(`  Status: ${response2.status}`, 'yellow');
    log(`  Has login form: ${hasLoginForm2 ? 'YES' : 'NO'}`, hasLoginForm2 ? 'red' : 'green');
    log(`  Has protected content: ${hasContent ? 'YES' : 'NO'}`, hasContent ? 'red' : 'green');
    
    if (!hasLoginForm2 && hasContent) {
      log(`  Result: 🚨 VULNERABLE - Cookie forgery successful!`, 'red');
    } else {
      log(`  Result: ✅ Protected - Cookie forgery failed`, 'green');
    }
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
  }
  
  // Test 3: With invalid cookie value
  log('\nTest 3: Access with INVALID cookie (actas_auth=hacked)', 'cyan');
  try {
    const response3 = await fetch(`${BASE_URL}/actas`, {
      headers: {
        'Cookie': 'actas_auth=hacked'
      }
    });
    const html3 = await response3.text();
    const hasLoginForm3 = html3.includes('Contrasenya');
    
    log(`  Status: ${response3.status}`, 'yellow');
    log(`  Has login form: ${hasLoginForm3 ? 'YES' : 'NO'}`, hasLoginForm3 ? 'green' : 'red');
    log(`  Result: ${hasLoginForm3 ? '✅ Blocked' : '❌ Bypassed'}`, hasLoginForm3 ? 'green' : 'red');
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
  }
  
  // Test 4: Multiple cookie variations
  log('\nTest 4: Testing various cookie values', 'cyan');
  const testValues = [
    'authenticated',
    'Authenticated',
    'AUTHENTICATED',
    'true',
    '1',
    'yes',
  ];
  
  for (const value of testValues) {
    try {
      const response = await fetch(`${BASE_URL}/actas`, {
        headers: {
          'Cookie': `actas_auth=${value}`
        }
      });
      const html = await response.text();
      const bypassed = !html.includes('Contrasenya');
      
      log(`  actas_auth="${value}": ${bypassed ? '🚨 BYPASSED' : '✅ Blocked'}`, bypassed ? 'red' : 'green');
    } catch (error) {
      log(`  actas_auth="${value}": Error`, 'yellow');
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  log('\n' + '═'.repeat(60), 'magenta');
  log('📊 ANALYSIS', 'magenta');
  log('═'.repeat(60), 'magenta');
  
  log('\n🔍 Current Implementation (src/lib/auth.ts:44-48):', 'cyan');
  log(`
  export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies()
    const session = cookieStore.get(SESSION_COOKIE)
    return session?.value === 'authenticated'  // ⚠️ VULNERABLE
  }
  `, 'yellow');
  
  log('🚨 VULNERABILITY DETAILS:', 'red');
  log('  • Cookie value is a simple string: "authenticated"', 'red');
  log('  • Anyone can create this cookie manually', 'red');
  log('  • HttpOnly flag prevents JavaScript access BUT...', 'yellow');
  log('  • Users can manually edit cookies via DevTools', 'red');
  log('  • Browser extensions can modify cookies', 'red');
  log('  • No cryptographic signature to verify authenticity', 'red');
  
  log('\n💡 HOW TO EXPLOIT (as a user):', 'magenta');
  log('  1. Open http://localhost:3000/actas', 'yellow');
  log('  2. Open DevTools (F12) → Application → Cookies', 'yellow');
  log('  3. Add new cookie:', 'yellow');
  log('     Name: actas_auth', 'cyan');
  log('     Value: authenticated', 'cyan');
  log('     Domain: localhost', 'cyan');
  log('     Path: /', 'cyan');
  log('  4. Refresh page → Access granted without password!', 'red');
  
  log('\n🛡️ FIX REQUIRED:', 'green');
  log('  Replace simple string with signed JWT token:', 'green');
  log(`
  // ✅ SECURE - Using JWT with signature
  import { SignJWT, jwtVerify } from 'jose'
  
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  
  export async function createSession() {
    const token = await new SignJWT({ authenticated: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)
    
    cookieStore.set(SESSION_COOKIE, token, { ... })
  }
  
  export async function isAuthenticated(): Promise<boolean> {
    const session = cookieStore.get(SESSION_COOKIE)
    if (!session?.value) return false
    
    try {
      await jwtVerify(session.value, secret)
      return true
    } catch {
      return false  // Invalid/expired token
    }
  }
  `, 'green');
  
  log('\n⚠️  SEVERITY: CRITICAL', 'red');
  log('Any user with basic knowledge can bypass authentication', 'red');
  log('This makes the password protection completely ineffective\n', 'red');
}

testCookieForgery().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
