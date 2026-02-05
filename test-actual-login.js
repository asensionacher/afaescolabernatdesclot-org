/**
 * Test actual login with Server Action
 */
async function testLogin() {
  console.log('\n🧪 Testing actual login flow...\n');
  
  const password = 'Wildness4-Chop8-Stung1-Theme0';
  console.log(`Password: ${password}`);
  console.log(`Length: ${password.length}\n`);
  
  // Import the actual login function
  const { login } = await import('./src/lib/auth.ts');
  
  try {
    const result = await login(password);
    console.log('Login result:', result);
    
    if (result.success) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('The password works correctly.');
    } else {
      console.log('\n❌ LOGIN FAILED!');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.log('\n❌ ERROR during login:');
    console.error(error);
  }
}

testLogin();
