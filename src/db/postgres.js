import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL 9.6 connection pool
const pg96Pool = new Pool({
  host: process.env.PG96_HOST || 'localhost',
  port: process.env.PG96_PORT || 5432,
  database: process.env.PG96_DB || 'sql_training_96',
  user: process.env.PG_USER || 'sqltraining',
  password: process.env.PG_PASSWORD || 'training123',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// PostgreSQL 13 connection pool
const pg13Pool = new Pool({
  host: process.env.PG13_HOST || 'localhost',
  port: process.env.PG13_PORT || 5433,
  database: process.env.PG13_DB || 'sql_training_13',
  user: process.env.PG_USER || 'sqltraining',
  password: process.env.PG_PASSWORD || 'training123',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Helper to execute with schema context
// Supports both plain SQL and parameterized queries
export async function queryPg96(sql, params = [], schema = 'public') {
  const client = await pg96Pool.connect();
  try {
    if (schema !== 'public') {
      await client.query(`SET search_path TO ${schema}`);
    }
    const result = params.length > 0
      ? await client.query(sql, params)
      : await client.query(sql);
    return result;
  } finally {
    client.release();
  }
}

export async function queryPg13(sql, params = [], schema = 'public') {
  const client = await pg13Pool.connect();
  try {
    if (schema !== 'public') {
      await client.query(`SET search_path TO ${schema}`);
    }
    const result = params.length > 0
      ? await client.query(sql, params)
      : await client.query(sql);
    return result;
  } finally {
    client.release();
  }
}

// Cleanup function for tests
export async function closePools() {
  await pg96Pool.end();
  await pg13Pool.end();
}

// Export pools for direct access if needed
export { pg96Pool, pg13Pool };