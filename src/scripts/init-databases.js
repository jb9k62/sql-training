import { queryPg96, queryPg13, closePools } from '../db/postgres.js';

async function initializeSchemas() {
  console.log('🔧 Initializing database schemas...\n');

  try {
    // Create public schema if needed and set up extensions
    console.log('📦 Setting up PostgreSQL 9.6...');
    await queryPg96('CREATE SCHEMA IF NOT EXISTS public');
    // Enable useful extensions
    await queryPg96('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ PostgreSQL 9.6 initialized');

    console.log('\n📦 Setting up PostgreSQL 13...');
    await queryPg13('CREATE SCHEMA IF NOT EXISTS public');
    // Enable useful extensions
    await queryPg13('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryPg13('CREATE EXTENSION IF NOT EXISTS "pg_trgm"'); // For text search
    console.log('✅ PostgreSQL 13 initialized');

    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 You can now run tests with:');
    console.log('   npm test              - Run all tests');
    console.log('   npm run test:pg96     - Test PostgreSQL 9.6 only');
    console.log('   npm run test:pg13     - Test PostgreSQL 13 only');
    console.log('   npm run test:sqlite   - Test SQLite only');

  } catch (error) {
    console.error('❌ Error initializing databases:', error.message);
    console.error('\n💡 Tip: Make sure databases are ready with: npm run db:wait');
    process.exit(1);
  } finally {
    await closePools();
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  initializeSchemas().catch(console.error);
}

export { initializeSchemas };