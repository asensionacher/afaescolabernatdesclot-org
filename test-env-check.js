// Check if environment variables are loaded in Next.js context
console.log('Environment Variables Check:');
console.log('============================');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? `Found (${process.env.JWT_SECRET.substring(0, 20)}...)` : 'NOT FOUND');
console.log('ACTAS_PASSWORD_HASH:', process.env.ACTAS_PASSWORD_HASH ? `Found (${process.env.ACTAS_PASSWORD_HASH.substring(0, 20)}...)` : 'NOT FOUND');
console.log('');

if (!process.env.JWT_SECRET || !process.env.ACTAS_PASSWORD_HASH) {
  console.log('❌ Missing environment variables!');
  console.log('Make sure .env.local exists and server is restarted');
  process.exit(1);
} else {
  console.log('✅ Environment variables are loaded');
}
