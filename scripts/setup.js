#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Idea Manager...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local from template...');
  const envExample = `# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"

# JWT Secret (generate a secure random string)
JWT_SECRET="${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}"
`;
  
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env.local created successfully!');
} else {
  console.log('✅ .env.local already exists');
}

console.log('\n📋 Next steps:');
console.log('1. Set up your Neon PostgreSQL database');
console.log('2. Update DATABASE_URL in .env.local');
console.log('3. Get your OpenAI API key and update OPENAI_API_KEY in .env.local');
console.log('4. Run: npm run dev');
console.log('5. Initialize database: curl -X POST http://localhost:3000/api/init-db -H "Content-Type: application/json" -d \'{"email":"admin@example.com"}\'');
console.log('\n🎉 Setup complete! Happy coding!'); 