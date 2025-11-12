import pg from 'pg';
import { setTimeout } from 'timers/promises';

const { Client } = pg;

async function waitForDatabase(config, maxAttempts = 30) {
  const client = new Client(config);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log(`✅ Database ${config.database} is ready on port ${config.port}`);
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for ${config.database}... (attempt ${attempt}/${maxAttempts})`);
      await setTimeout(1000);
    }
  }

  throw new Error(`Database ${config.database} did not become ready after ${maxAttempts} attempts`);
}

async function main() {
  console.log('🔍 Checking database availability...\n');

  try {
    // Wait for PostgreSQL 9.6
    await waitForDatabase({
      host: process.env.PG96_HOST || 'localhost',
      port: process.env.PG96_PORT || 5432,
      database: process.env.PG96_DB || 'sql_training_96',
      user: process.env.PG_USER || 'sqltraining',
      password: process.env.PG_PASSWORD || 'training123'
    });

    // Wait for PostgreSQL 13
    await waitForDatabase({
      host: process.env.PG13_HOST || 'localhost',
      port: process.env.PG13_PORT || 5433,
      database: process.env.PG13_DB || 'sql_training_13',
      user: process.env.PG_USER || 'sqltraining',
      password: process.env.PG_PASSWORD || 'training123'
    });

    console.log('\n✅ All databases are ready!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Tip: Make sure Docker containers are running with: npm run docker:up');
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}

export { waitForDatabase };