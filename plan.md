# SQL Training Environment Implementation Plan

## Overview
A comprehensive SQL training environment for senior engineering interview preparation, focusing on PostgreSQL (9.6 & 13) and SQLite, with raw SQL execution via Node.js libraries and Vitest testing framework.

## Technical Stack

### Core Technologies
- **Runtime**: Node.js with npm
- **Testing**: Vitest
- **PostgreSQL Client**: `pg` (using native parameterized queries)
- **SQLite Client**: `better-sqlite3` (2-10x faster than alternatives, native prepared statements)
- **Containerization**: Docker Compose for PostgreSQL versions
- **Language**: JavaScript (no TypeScript for simplicity)

### Database Architecture
- **PostgreSQL 9.6**: Separate database (`sql_training_96`) with exercise-specific schemas
- **PostgreSQL 13**: Separate database (`sql_training_13`) with exercise-specific schemas
- **Schema Organization**: Each exercise can have its own schema (e.g., `fundamentals_01`, `joins_01`) within each database
- **SQLite**: Each exercise can have its own tables/database file
- **No ORM**: Direct SQL execution returning arrays of untyped objects

## Project Structure

```
sql-training/
├── docker/
│   └── docker-compose.yml              # PostgreSQL 9.6 & 13 containers
├── src/
│   ├── db/
│   │   ├── postgres.js                 # PostgreSQL connection pools
│   │   └── sqlite.js                   # SQLite database helpers
│   ├── utils/
│   │   ├── sql-executor.js             # Execute SQL from files
│   │   └── test-helpers.js             # Custom test assertions
│   └── setup/
│       └── test-setup.js               # Vitest global setup
├── exercises/
│   ├── 01-fundamentals/
│   │   └── 01-basic-select/
│   │       ├── README.md               # Exercise instructions
│   │       ├── exercise.sql            # Student template (with TODOs)
│   │       ├── solution.sql            # Master answer
│   │       ├── seed.sql                # Test data setup
│   │       └── exercise.test.js        # Vitest test specifications
│   ├── 02-joins/
│   │   └── 01-inner-join/
│   ├── 03-aggregates/
│   │   └── 01-group-by/
│   ├── 04-functions/
│   │   └── 01-string-manipulation/
│   ├── 05-subqueries/
│   │   └── 01-scalar-subquery/
│   ├── 06-ctes/
│   │   └── 01-basic-cte/
│   ├── 07-window-functions/
│   │   └── 01-row-number/              # PostgreSQL only
│   ├── 08-upsert/
│   │   └── 01-insert-conflict/         # Version-specific syntax
│   ├── 09-json/
│   │   └── 01-json-operators/          # PostgreSQL only
│   └── 10-performance/
│       └── 01-explain-analyze/
├── data/                                # SQLite database files
├── .env.example                         # Environment variables template
├── .gitignore
├── package.json
├── vitest.config.js
└── README.md
```

## Phase 1: Infrastructure Setup

### 1.1 Initialize Project
- Create directory structure
- Initialize npm project
- Install dependencies:
  ```json
  {
    "dependencies": {
      "pg": "^8.13.1",
      "sql-template-strings": "^2.2.2",
      "better-sqlite3": "^11.7.0",
      "dotenv": "^16.4.5"
    },
    "devDependencies": {
      "vitest": "^2.1.8"
    }
  }
  ```

### 1.2 Docker Configuration
- Create `docker-compose.yml` with PostgreSQL 9.6 and 13
- Configure separate databases for each PostgreSQL version
- Set up health checks and volumes

```yaml
version: '3.8'

services:
  postgres96:
    image: postgres:9.6-alpine
    environment:
      POSTGRES_USER: sqltraining
      POSTGRES_PASSWORD: training123
      POSTGRES_DB: sql_training_96
    ports:
      - "5432:5432"
    volumes:
      - pg96_data:/var/lib/postgresql/data

  postgres13:
    image: postgres:13-alpine
    environment:
      POSTGRES_USER: sqltraining
      POSTGRES_PASSWORD: training123
      POSTGRES_DB: sql_training_13
    ports:
      - "5433:5432"
    volumes:
      - pg13_data:/var/lib/postgresql/data

volumes:
  pg96_data:
  pg13_data:
```

### 1.3 Database Connection Layer

**PostgreSQL Connection (`src/db/postgres.js`)**:
```javascript
import pg from 'pg';
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
```

**SQLite Connection (`src/db/sqlite.js`)**:
```javascript
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Cache open databases
const databases = new Map();

export function getDatabase(name = 'default') {
  if (!databases.has(name)) {
    const dbPath = name === ':memory:'
      ? ':memory:'
      : path.join(process.cwd(), 'data', `${name}.db`);

    // Ensure data directory exists
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const db = new Database(dbPath);
    databases.set(name, db);
  }
  return databases.get(name);
}

// Execute query with optional parameters
// Supports both positional (?) and named (:name) parameters
export function query(sql, params = [], dbName = 'default') {
  const db = getDatabase(dbName);
  const stmt = db.prepare(sql);

  // Determine operation type
  const operation = sql.trim().toUpperCase().split(' ')[0];

  switch (operation) {
    case 'SELECT':
      // Handle both array params and object params for named parameters
      if (Array.isArray(params)) {
        return params.length ? stmt.all(...params) : stmt.all();
      } else {
        return stmt.all(params); // Named parameters as object
      }

    case 'INSERT':
    case 'UPDATE':
    case 'DELETE':
      let result;
      if (Array.isArray(params)) {
        result = params.length ? stmt.run(...params) : stmt.run();
      } else {
        result = stmt.run(params); // Named parameters as object
      }
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };

    default:
      // For CREATE, DROP, etc.
      return stmt.run();
  }
}

export function closeAll() {
  for (const [name, db] of databases.entries()) {
    db.close();
    databases.delete(name);
  }
}
```

## Phase 2: Testing Framework

### 2.1 Vitest Configuration

**`vitest.config.js`**:
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/setup/test-setup.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Run tests sequentially to avoid database conflicts
    threads: false,
    // Watch mode settings
    watchExclude: ['**/data/**', '**/node_modules/**']
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@exercises': new URL('./exercises', import.meta.url).pathname
    }
  }
});
```

**`src/setup/test-setup.js`** (Global test setup):
```javascript
import { beforeAll, afterAll, afterEach } from 'vitest';
import { closePools } from '../db/postgres.js';
import { closeAll as closeSqlite } from '../db/sqlite.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Global cleanup after all tests
afterAll(async () => {
  await closePools();
  closeSqlite();
});

// Set test environment flag
process.env.NODE_ENV = 'test';
```

### 2.2 Test Utilities

**`src/utils/sql-executor.js`** (Execute SQL from files):
```javascript
import fs from 'fs/promises';
import path from 'path';
import { queryPg96, queryPg13 } from '../db/postgres.js';
import { query as querySqlite, getDatabase } from '../db/sqlite.js';

export class SqlExecutor {
  constructor(database = 'pg13', schema = 'public') {
    this.database = database;
    this.schema = schema;
  }

  async executeFile(filePath) {
    const sql = await fs.readFile(filePath, 'utf-8');
    return this.execute(sql);
  }

  async execute(sql) {
    const startTime = Date.now();

    try {
      let result;

      switch (this.database) {
        case 'pg96':
          result = await queryPg96(sql, [], this.schema);
          return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields?.map(f => f.name) || [],
            executionTime: Date.now() - startTime
          };

        case 'pg13':
          result = await queryPg13(sql, [], this.schema);
          return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields?.map(f => f.name) || [],
            executionTime: Date.now() - startTime
          };

        case 'sqlite':
          // SQLite returns array directly for SELECT
          result = querySqlite(sql, [], this.schema);
          const rows = Array.isArray(result) ? result : [];
          return {
            rows,
            rowCount: rows.length,
            fields: rows.length > 0 ? Object.keys(rows[0]) : [],
            executionTime: Date.now() - startTime
          };

        default:
          throw new Error(`Unknown database: ${this.database}`);
      }
    } catch (error) {
      throw new Error(`SQL execution failed: ${error.message}\nSQL: ${sql.substring(0, 200)}`);
    }
  }

  // Execute parameterized query (recommended for user input)
  async executeWithParams(sql, params = []) {
    const startTime = Date.now();

    try {
      let result;

      switch (this.database) {
        case 'pg96':
          result = await queryPg96(sql, params, this.schema);
          return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields?.map(f => f.name) || [],
            executionTime: Date.now() - startTime
          };

        case 'pg13':
          result = await queryPg13(sql, params, this.schema);
          return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields?.map(f => f.name) || [],
            executionTime: Date.now() - startTime
          };

        case 'sqlite':
          const db = getDatabase(this.schema);
          const stmt = db.prepare(sql);
          const rows = stmt.all(...params);
          return {
            rows,
            rowCount: rows.length,
            fields: rows.length > 0 ? Object.keys(rows[0]) : [],
            executionTime: Date.now() - startTime
          };

        default:
          throw new Error(`Unknown database: ${this.database}`);
      }
    } catch (error) {
      throw new Error(`Parameterized query failed: ${error.message}`);
    }
  }

  async seed(seedPath) {
    const sql = await fs.readFile(seedPath, 'utf-8');

    // Split statements by semicolon for multi-statement support
    const statements = sql
      .split(/;\s*$|;\s*\n/gm)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      await this.execute(statement + ';');
    }
  }
}
```

**`src/utils/test-helpers.js`** (Custom assertions):
```javascript
import { expect } from 'vitest';

// Assert row count
export function expectRowCount(result, expected) {
  expect(result.rowCount, `Expected ${expected} rows but got ${result.rowCount}`).toBe(expected);
}

// Assert columns exist
export function expectColumns(result, expectedColumns) {
  const missing = expectedColumns.filter(col => !result.fields.includes(col));
  expect(missing, `Missing columns: ${missing.join(', ')}`).toHaveLength(0);
}

// Assert specific row contains data
export function expectRowContains(result, rowIndex, expectedData) {
  const row = result.rows[rowIndex];
  expect(row, `Row ${rowIndex} not found`).toBeDefined();

  for (const [key, value] of Object.entries(expectedData)) {
    expect(row[key], `Row ${rowIndex}: expected ${key}=${value} but got ${row[key]}`).toBe(value);
  }
}

// Assert column values are ordered
export function expectOrdered(result, column, order = 'asc') {
  const values = result.rows.map(r => r[column]);
  const sorted = [...values].sort((a, b) => {
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;

    if (order === 'asc') {
      return a < b ? -1 : a > b ? 1 : 0;
    } else {
      return a > b ? -1 : a < b ? 1 : 0;
    }
  });

  expect(values, `Column ${column} not sorted ${order}`).toEqual(sorted);
}

// Assert no null values in column
export function expectNoNulls(result, column) {
  const nullCount = result.rows.filter(r => r[column] === null || r[column] === undefined).length;
  expect(nullCount, `Found ${nullCount} null values in column ${column}`).toBe(0);
}

// Assert unique values in column
export function expectUnique(result, column) {
  const values = result.rows.map(r => r[column]);
  const unique = new Set(values);
  expect(unique.size, `Column ${column} has duplicate values`).toBe(values.length);
}

// Compare two results for equality
export function expectResultsEqual(actual, expected) {
  expect(actual.rowCount).toBe(expected.rowCount);
  expect(actual.fields.sort()).toEqual(expected.fields.sort());
  expect(actual.rows).toEqual(expected.rows);
}
```

### 2.3 Test Structure Template

**`exercises/template/exercise.test.js`** (Template for all exercise tests):
```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { SqlExecutor } from '@/utils/sql-executor.js';
import {
  expectRowCount,
  expectColumns,
  expectOrdered,
  expectNoNulls
} from '@/utils/test-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure which databases this exercise supports
const DATABASES = ['pg96', 'pg13', 'sqlite']; // Adjust per exercise

describe.each(DATABASES)('%s: Exercise Name', (database) => {
  let executor;
  const schema = 'exercise_schema_name'; // e.g., 'fundamentals_01'

  beforeAll(async () => {
    executor = new SqlExecutor(database, schema);

    // Load seed data
    const seedPath = path.join(__dirname, 'seed.sql');
    await executor.seed(seedPath);
  });

  afterAll(async () => {
    // Cleanup schema (PostgreSQL only)
    if (database.startsWith('pg')) {
      await executor.execute(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    }
  });

  describe('Exercise Requirements', () => {
    it('should return correct number of rows', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      expectRowCount(result, 5);
    });

    it('should have required columns', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      expectColumns(result, ['id', 'name', 'email']);
    });

    it('should be ordered correctly', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      expectOrdered(result, 'created_at', 'desc');
    });
  });

  describe('Solution Validation', () => {
    it('exercise should match solution output', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const solutionPath = path.join(__dirname, 'solution.sql');

      const exerciseResult = await executor.executeFile(exercisePath);
      const solutionResult = await executor.executeFile(solutionPath);

      // Results should be identical
      expect(exerciseResult.rows).toEqual(solutionResult.rows);
    });
  });
});
```

## Phase 3: Exercise Implementation

### 3.1 Complete Exercise Examples

#### Exercise 01: Fundamentals - Basic SELECT

**`exercises/01-fundamentals/01-basic-select/README.md`**:
```markdown
# Basic SELECT with Filtering

**Difficulty:** Beginner
**Databases:** PostgreSQL 9.6, PostgreSQL 13, SQLite
**Time:** 10 minutes

## Learning Objectives
- Write basic SELECT statements
- Filter results using WHERE clause
- Sort results with ORDER BY
- Limit results with LIMIT/OFFSET

## Instructions

You have a `users` table with customer information. Write a SQL query that:

1. Selects users who registered after January 1, 2024
2. Only includes users from 'USA' or 'Canada'
3. Returns name, email, country, and created_at columns
4. Orders results by created_at descending (newest first)
5. Limits to 10 results

## Expected Output Structure
```
name        | email                | country | created_at
------------|---------------------|---------|------------
John Smith  | john@example.com    | USA     | 2024-06-15
Jane Doe    | jane@example.com    | Canada  | 2024-06-10
...
```

## Hints
- Use `WHERE created_at > '2024-01-01'` for date filtering
- Use `IN ('USA', 'Canada')` for multiple country values
- Remember to specify all required columns in SELECT
```

**`exercises/01-fundamentals/01-basic-select/seed.sql`**:
```sql
-- PostgreSQL version
-- Create schema for this exercise
DROP SCHEMA IF EXISTS fundamentals_01 CASCADE;
CREATE SCHEMA fundamentals_01;
SET search_path TO fundamentals_01;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  country VARCHAR(50),
  age INTEGER,
  created_at DATE NOT NULL
);

-- Insert test data
INSERT INTO users (name, email, country, age, created_at) VALUES
  ('John Smith', 'john@example.com', 'USA', 35, '2024-06-15'),
  ('Jane Doe', 'jane@example.com', 'Canada', 28, '2024-06-10'),
  ('Bob Johnson', 'bob@example.com', 'USA', 42, '2024-05-20'),
  ('Alice Brown', 'alice@example.com', 'UK', 31, '2024-04-15'),
  ('Charlie Wilson', 'charlie@example.com', 'Canada', 29, '2024-03-10'),
  ('Diana Prince', 'diana@example.com', 'USA', 33, '2024-02-28'),
  ('Eve Adams', 'eve@example.com', 'Australia', 27, '2024-01-15'),
  ('Frank Miller', 'frank@example.com', 'Canada', 38, '2024-07-01'),
  ('Grace Lee', 'grace@example.com', 'USA', 26, '2024-06-25'),
  ('Henry Ford', 'henry@example.com', 'UK', 45, '2023-12-20'),
  ('Iris West', 'iris@example.com', 'USA', 30, '2024-05-05'),
  ('Jack Ryan', 'jack@example.com', 'Canada', 41, '2024-04-20');

-- Note: SQLite version would omit schema creation
```

**`exercises/01-fundamentals/01-basic-select/exercise.sql`**:
```sql
-- TODO: Write a query that:
-- 1. Selects users registered after January 1, 2024
-- 2. Only from USA or Canada
-- 3. Returns: name, email, country, created_at
-- 4. Ordered by created_at descending
-- 5. Limited to 10 results

-- WRITE YOUR QUERY HERE:
```

**`exercises/01-fundamentals/01-basic-select/solution.sql`**:
```sql
SELECT name, email, country, created_at
FROM users
WHERE created_at > '2024-01-01'
  AND country IN ('USA', 'Canada')
ORDER BY created_at DESC
LIMIT 10;
```

#### Exercise 02: Joins - INNER JOIN

**`exercises/02-joins/01-inner-join/README.md`**:
```markdown
# INNER JOIN - Orders and Users

**Difficulty:** Beginner-Intermediate
**Databases:** PostgreSQL 9.6, PostgreSQL 13, SQLite
**Time:** 15 minutes

## Learning Objectives
- Understand INNER JOIN syntax
- Join tables on foreign key relationships
- Select columns from multiple tables
- Apply WHERE conditions on joined data

## Instructions

You have two tables:
- `users`: Customer information
- `orders`: Order information with user_id foreign key

Write a query that:
1. Joins users and orders tables
2. Only includes orders with total > $100
3. Returns user name, email, order_id, order_date, and total
4. Orders by order_date descending

## Table Structures
```sql
users: id, name, email
orders: id, user_id, order_date, total, status
```

## Expected Output
```
name       | email               | order_id | order_date | total
-----------|---------------------|----------|------------|-------
Alice Brown| alice@example.com   | 5        | 2024-06-15 | 250.00
Bob Smith  | bob@example.com     | 3        | 2024-06-10 | 150.00
```
```

**`exercises/02-joins/01-inner-join/seed.sql`**:
```sql
-- PostgreSQL version
DROP SCHEMA IF EXISTS joins_01 CASCADE;
CREATE SCHEMA joins_01;
SET search_path TO joins_01;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  order_date DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
);

INSERT INTO users (id, name, email) VALUES
  (1, 'Alice Brown', 'alice@example.com'),
  (2, 'Bob Smith', 'bob@example.com'),
  (3, 'Charlie Davis', 'charlie@example.com'),
  (4, 'Diana Wilson', 'diana@example.com');

INSERT INTO orders (user_id, order_date, total, status) VALUES
  (1, '2024-06-01', 50.00, 'completed'),
  (1, '2024-06-15', 250.00, 'completed'),
  (2, '2024-06-10', 150.00, 'completed'),
  (3, '2024-06-05', 75.00, 'pending'),
  (2, '2024-05-20', 200.00, 'completed'),
  (4, '2024-06-08', 125.00, 'completed');
```

**`exercises/02-joins/01-inner-join/solution.sql`**:
```sql
SELECT
  u.name,
  u.email,
  o.id as order_id,
  o.order_date,
  o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.total > 100
ORDER BY o.order_date DESC;
```

#### Exercise 03: Aggregates - GROUP BY

**`exercises/03-aggregates/01-group-by/solution.sql`**:
```sql
SELECT
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent,
  AVG(o.total) as avg_order_value
FROM users u
INNER JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING SUM(o.total) > 200
ORDER BY total_spent DESC;
```

#### Exercise 07: Window Functions (PostgreSQL only)

**`exercises/07-window-functions/01-row-number/seed.sql`**:
```sql
-- PostgreSQL only
DROP SCHEMA IF EXISTS window_01 CASCADE;
CREATE SCHEMA window_01;
SET search_path TO window_01;

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50),
  name VARCHAR(100),
  price DECIMAL(10,2),
  stock INTEGER
);

INSERT INTO products (category, name, price, stock) VALUES
  ('Electronics', 'Laptop', 999.99, 50),
  ('Electronics', 'Phone', 699.99, 100),
  ('Electronics', 'Tablet', 399.99, 75),
  ('Clothing', 'T-Shirt', 19.99, 200),
  ('Clothing', 'Jeans', 59.99, 150),
  ('Clothing', 'Jacket', 99.99, 80);
```

**`exercises/07-window-functions/01-row-number/solution.sql`**:
```sql
SELECT
  category,
  name,
  price,
  ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as price_rank,
  RANK() OVER (PARTITION BY category ORDER BY price DESC) as price_rank_with_ties,
  SUM(price) OVER (PARTITION BY category) as category_total
FROM products
ORDER BY category, price_rank;
```

## Phase 4: Complete Project Configuration

### 4.1 Package.json Configuration

**`package.json`**:
```json
{
  "name": "sql-training",
  "version": "1.0.0",
  "description": "Comprehensive SQL training environment for senior engineering interviews",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:pg96": "DATABASE=pg96 vitest",
    "test:pg13": "DATABASE=pg13 vitest",
    "test:sqlite": "DATABASE=sqlite vitest",
    "test:all": "npm run test:pg96 && npm run test:pg13 && npm run test:sqlite",
    "test:exercise": "vitest --run",
    "docker:up": "docker-compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker-compose -f docker/docker-compose.yml down",
    "docker:restart": "npm run docker:down && npm run docker:up",
    "docker:logs": "docker-compose -f docker/docker-compose.yml logs -f",
    "setup": "npm run docker:up && npm run db:wait && npm run db:init",
    "db:wait": "node src/scripts/wait-for-db.js",
    "db:init": "node src/scripts/init-databases.js",
    "clean": "rm -rf data/*.db node_modules"
  },
  "dependencies": {
    "pg": "^8.13.1",
    "better-sqlite3": "^11.7.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "vitest": "^2.1.8",
    "@types/node": "^22.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "sql",
    "training",
    "postgresql",
    "sqlite",
    "education"
  ],
  "author": "",
  "license": "MIT"
}
```

### 4.2 Environment Configuration

**`.env.example`**:
```bash
# PostgreSQL 9.6
PG96_HOST=localhost
PG96_PORT=5432
PG96_DB=sql_training_96
PG_USER=sqltraining
PG_PASSWORD=training123

# PostgreSQL 13
PG13_HOST=localhost
PG13_PORT=5433
PG13_DB=sql_training_13

# Default database for testing
DATABASE=pg13

# Node environment
NODE_ENV=development
```

**`.gitignore`**:
```gitignore
# Dependencies
node_modules/

# Environment files
.env
.env.local
.env.test.local

# SQLite databases
data/*.db
data/*.sqlite

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Test coverage
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
```

### 4.3 Helper Scripts

**`src/scripts/wait-for-db.js`** (Wait for PostgreSQL to be ready):
```javascript
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
      console.log(`✅ Database ${config.database} is ready`);
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for ${config.database}... (attempt ${attempt}/${maxAttempts})`);
      await setTimeout(1000);
    }
  }

  throw new Error(`Database ${config.database} did not become ready`);
}

async function main() {
  // Wait for PostgreSQL 9.6
  await waitForDatabase({
    host: 'localhost',
    port: 5432,
    database: 'sql_training_96',
    user: 'sqltraining',
    password: 'training123'
  });

  // Wait for PostgreSQL 13
  await waitForDatabase({
    host: 'localhost',
    port: 5433,
    database: 'sql_training_13',
    user: 'sqltraining',
    password: 'training123'
  });

  console.log('✅ All databases are ready!');
}

main().catch(console.error);
```

**`src/scripts/init-databases.js`** (Initialize database schemas):
```javascript
import { queryPg96, queryPg13 } from '../db/postgres.js';

async function initializeSchemas() {
  console.log('🔧 Initializing database schemas...');

  // Create public schema if needed
  await queryPg96('CREATE SCHEMA IF NOT EXISTS public');
  await queryPg13('CREATE SCHEMA IF NOT EXISTS public');

  console.log('✅ Database initialization complete');
}

initializeSchemas().catch(console.error);
```

## Phase 5: Implementation Instructions

### 5.1 Day 1-2: Foundation Setup

**Step-by-step instructions for implementers:**

1. **Initialize project**:
```bash
mkdir sql-training
cd sql-training
npm init -y
npm install pg better-sqlite3 dotenv
npm install -D vitest
```

2. **Create directory structure**:
```bash
mkdir -p docker src/{db,utils,scripts,setup} exercises data
touch docker/docker-compose.yml
touch src/db/{postgres.js,sqlite.js}
touch src/utils/{sql-executor.js,test-helpers.js}
```

3. **Copy configuration files**:
   - Create `package.json` with scripts from section 4.1
   - Create `.env` from `.env.example` template
   - Create `vitest.config.js` from section 2.1
   - Create `docker-compose.yml` from section 1.2

4. **Start Docker containers**:
```bash
npm run docker:up
npm run db:wait  # Wait for databases to be ready
```

### 5.2 Day 3: Testing Framework

1. **Implement database connection layers**:
   - Copy `src/db/postgres.js` from section 1.3
   - Copy `src/db/sqlite.js` from section 1.3

2. **Create test utilities**:
   - Copy `src/utils/sql-executor.js` from section 2.2
   - Copy `src/utils/test-helpers.js` from section 2.2

3. **Set up test configuration**:
   - Copy `src/setup/test-setup.js` from section 2.1
   - Create test template in `exercises/template/`

### 5.3 Day 4-7: Exercise Implementation

For each exercise category:

1. **Create exercise directory**:
```bash
mkdir -p exercises/01-fundamentals/01-basic-select
```

2. **Create exercise files**:
   - README.md - Instructions and objectives
   - seed.sql - Test data (with schema creation for PostgreSQL)
   - exercise.sql - Blank template with TODOs
   - solution.sql - Complete answer
   - exercise.test.js - Test specifications

3. **Test the exercise**:
```bash
npm test exercises/01-fundamentals/01-basic-select
```

## Phase 6: Common Issues and Solutions

### 6.1 Database Connection Issues

**Problem**: "Connection refused" errors

**Solutions**:
```bash
# Check if containers are running
docker ps

# Check logs for errors
npm run docker:logs

# Restart containers
npm run docker:restart
```

**Problem**: "Database does not exist"

**Solution**: Ensure Docker containers created databases:
```bash
docker exec -it sql-training-postgres96 psql -U sqltraining -c "\l"
```

### 6.2 Schema Issues

**Problem**: "Schema not found" errors

**Solution**: Each exercise's seed.sql must create its schema:
```sql
DROP SCHEMA IF EXISTS exercise_name CASCADE;
CREATE SCHEMA exercise_name;
SET search_path TO exercise_name;
```

### 6.3 SQLite Compatibility

**Problem**: PostgreSQL syntax not working in SQLite

**Common differences**:
- SQLite: `REPLACE INTO` instead of `INSERT ON CONFLICT`
- SQLite: No schemas (ignore SET search_path)
- SQLite: `INTEGER` for auto-increment (not SERIAL)
- SQLite: Limited ALTER TABLE support

**Solution**: Create separate seed files or use conditional logic:
```javascript
if (database === 'sqlite') {
  // SQLite-specific SQL
} else {
  // PostgreSQL SQL
}
```

### 6.4 Test Failures

**Problem**: Tests pass individually but fail together

**Solution**: Ensure proper cleanup:
```javascript
afterAll(async () => {
  if (database.startsWith('pg')) {
    await executor.execute(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  }
});
```

## Phase 7: Validation Checklist

Before considering an exercise complete:

- [ ] README.md has clear instructions
- [ ] seed.sql creates schema (PostgreSQL) and test data
- [ ] exercise.sql has helpful TODO comments
- [ ] solution.sql works on all target databases
- [ ] exercise.test.js has at least 3 assertions
- [ ] Tests pass on all target databases
- [ ] No hardcoded database connections
- [ ] Proper schema isolation (PostgreSQL)

## Phase 8: Advanced Topics for Future Expansion

### 8.1 Additional Exercise Topics

- **Recursive CTEs**: Hierarchical queries, tree traversal
- **Full-text search**: PostgreSQL tsvector/tsquery
- **Partitioning**: Table partitioning strategies
- **Materialized views**: Performance optimization
- **Triggers**: Data validation and auditing
- **Stored procedures**: Database functions
- **Transactions**: ACID properties, isolation levels

### 8.2 Performance Testing

Add performance benchmarks:
```javascript
it('should execute within performance threshold', async () => {
  const result = await executor.executeFile('./solution.sql');
  expect(result.executionTime).toBeLessThan(100); // ms
});
```

### 8.3 Interactive Learning Mode

Future enhancement ideas:
- Web UI for exercise execution
- Progress tracking
- Hints system
- Solution comparison
- Performance leaderboard

## Conclusion

This plan provides a complete, implementation-ready SQL training environment with:
- Multi-database support (PostgreSQL 9.6, 13, SQLite)
- Schema isolation for clean exercise separation
- Comprehensive testing framework
- 10 exercise categories covering interview topics
- Detailed implementation instructions
- Troubleshooting guide

The modular design allows for easy expansion and customization based on learning needs.

## Appendix A: Claude Agent Configurations

### A.1 Exercise Generator Agent

**`.claude/skills/exercise-generator/skill.md`**:
```markdown
# SQL Exercise Generator

Generate SQL exercises from requirements or blog posts.

## Usage
Provide exercise requirements and I will create:
- README.md with instructions
- seed.sql with test data (handles schema creation)
- exercise.sql with TODO template
- solution.sql with complete answer
- exercise.test.js with Vitest tests

## Exercise Format
Each exercise should specify:
- Target databases (pg96, pg13, sqlite)
- Difficulty level
- Learning objectives
- Expected output

## Database Compatibility
I will handle version differences:
- PostgreSQL: Schema creation, SERIAL, specific functions
- SQLite: No schemas, INTEGER PRIMARY KEY, different syntax
```

**`.claude/skills/exercise-generator/config.json`**:
```json
{
  "name": "exercise-generator",
  "version": "1.0.0",
  "description": "Generate SQL training exercises",
  "commands": [
    {
      "name": "generate",
      "description": "Generate a new SQL exercise"
    }
  ]
}
```

### A.2 Ruby Test Migrator Agent

**`.claude/skills/test-migrator/skill.md`**:
```markdown
# Ruby to JavaScript Test Migrator

Convert Ruby RSpec/Minitest tests to Vitest.

## Conversion Rules
- RSpec `describe` → Vitest `describe`
- RSpec `it` → Vitest `it`
- `expect(x).to eq(y)` → `expect(x).toBe(y)`
- ActiveRecord queries → Raw SQL

## Usage
Provide Ruby test file and I will:
1. Convert test structure to Vitest
2. Translate assertions
3. Convert database queries to raw SQL
4. Add proper async/await

## Example
Input: RSpec test with ActiveRecord
Output: Vitest test with raw SQL using our SqlExecutor
```

**`.claude/skills/test-migrator/config.json`**:
```json
{
  "name": "test-migrator",
  "version": "1.0.0",
  "description": "Convert Ruby tests to JavaScript",
  "commands": [
    {
      "name": "migrate",
      "description": "Migrate Ruby test to Vitest"
    }
  ]
}
```

## Appendix B: Quick Reference

### B.1 Directory Structure Summary
```
sql-training/
├── docker/                    # Docker configuration
├── src/                       # Source code
│   ├── db/                   # Database connections
│   ├── utils/                # Test utilities
│   ├── scripts/              # Helper scripts
│   └── setup/                # Test setup
├── exercises/                # All exercises
│   └── [category]/[exercise]/
│       ├── README.md
│       ├── seed.sql
│       ├── exercise.sql
│       ├── solution.sql
│       └── exercise.test.js
├── data/                     # SQLite databases
└── Configuration files
```

### B.2 Essential Commands
```bash
# Setup
npm install                   # Install dependencies
npm run setup                # Start Docker & init databases

# Docker
npm run docker:up            # Start containers
npm run docker:down          # Stop containers
npm run docker:logs          # View logs

# Testing
npm test                     # Run all tests
npm run test:pg96           # Test PostgreSQL 9.6
npm run test:pg13           # Test PostgreSQL 13
npm run test:sqlite         # Test SQLite
npm run test:watch          # Watch mode

# Specific exercise
npm test exercises/01-fundamentals/01-basic-select
```

### B.3 Environment Variables
```bash
DATABASE=pg13               # Default test database
PG96_PORT=5432             # PostgreSQL 9.6 port
PG13_PORT=5433             # PostgreSQL 13 port
PG_USER=sqltraining        # Database user
PG_PASSWORD=training123    # Database password
```

### B.4 Database Differences Quick Reference

| Feature | PostgreSQL | SQLite |
|---------|------------|---------|
| Schemas | YES (CREATE SCHEMA) | NO |
| Auto-increment | SERIAL | INTEGER PRIMARY KEY |
| UPSERT | INSERT ON CONFLICT | REPLACE INTO |
| JSON | JSON/JSONB types | JSON functions only |
| Window Functions | Full support | Limited (3.25+) |
| CTEs | WITH RECURSIVE | WITH (no RECURSIVE until 3.8) |
| Date functions | Extensive | Limited |
| String concat | \|\| or CONCAT() | \|\| only |

### B.5 Parameterized Query Examples

```javascript
// PostgreSQL - Prevent SQL injection with parameterized queries
// NEVER do string concatenation with user input!

// ❌ BAD - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE name = '${userInput}'`;

// ✅ GOOD - Using parameterized queries
const result = await queryPg13(
  'SELECT * FROM users WHERE name = $1 AND age > $2',
  [userName, minAge]
);

// PostgreSQL uses $1, $2, $3... for parameters
const result = await pool.query(
  'INSERT INTO users (name, email, age) VALUES ($1, $2, $3)',
  ['Alice', 'alice@example.com', 25]
);

// SQLite - Using positional parameters (?)
const stmt = db.prepare('SELECT * FROM users WHERE name = ? AND age > ?');
const users = stmt.all(userName, minAge);

// SQLite - Using named parameters (more readable)
const stmt = db.prepare(`
  SELECT * FROM users
  WHERE name = :name
  AND age > :minAge
  AND country = :country
`);
const users = stmt.all({
  name: 'Alice',
  minAge: 25,
  country: 'USA'
});

// In SqlExecutor class
const result = await executor.executeWithParams(
  'SELECT * FROM products WHERE category = $1 AND price < $2',
  ['Electronics', 1000]
);
```

### B.6 Test Assertion Reference
```javascript
// Row count
expectRowCount(result, 5);

// Columns
expectColumns(result, ['id', 'name']);

// Ordering
expectOrdered(result, 'created_at', 'desc');

// No nulls
expectNoNulls(result, 'email');

// Unique values
expectUnique(result, 'id');

// Specific row data
expectRowContains(result, 0, { name: 'Alice' });

// Results equality
expectResultsEqual(actual, expected);
```

## Final Notes

This comprehensive plan provides everything needed for a future implementer to build the SQL training environment. Key features:

1. **Complete code examples** - All critical files have full implementations
2. **Step-by-step instructions** - Clear daily implementation guide
3. **Troubleshooting section** - Common issues and solutions
4. **Exercise templates** - Full examples for each category
5. **Test infrastructure** - Complete testing framework with custom assertions
6. **Database compatibility** - Handles PostgreSQL 9.6, 13, and SQLite differences
7. **Schema isolation** - Each exercise has its own schema for clean separation

The plan is designed to be executable by any developer familiar with Node.js and SQL, providing a robust training environment for senior engineering interview preparation.
1. Initialize npm project
2. Install dependencies
3. Create directory structure
4. Set up Docker Compose
5. Configure environment variables

### Day 2: Database Layer
6. Implement PostgreSQL connection pools
7. Create SQLite helpers
8. Build SQL executor utility
9. Test database connections

### Day 3: Testing Framework
10. Configure Vitest
11. Create test helpers
12. Implement custom assertions
13. Set up test isolation

### Day 4-5: Basic Exercises
14. Create fundamentals exercises
15. Implement joins exercises
16. Build aggregates exercises
17. Add functions exercises

### Day 6-7: Advanced Exercises
18. Create subqueries exercises
19. Implement CTE exercises
20. Build window functions (PostgreSQL)
21. Add JSON exercises (PostgreSQL)

### Day 8: Version-Specific & Performance
22. Create upsert exercises (version-specific syntax)
23. Implement performance optimization exercises
24. Add EXPLAIN ANALYZE examples

### Day 9: Testing & Validation
25. Run all exercises on PostgreSQL 9.6
26. Test on PostgreSQL 13
27. Validate SQLite exercises
28. Fix any compatibility issues

### Day 10: Documentation & Polish
29. Complete main README
30. Write exercise documentation
31. Create usage guides
32. Add example solutions

## Key Implementation Details

### Database Version Handling
- **PostgreSQL 9.6**: Separate database `sql_training_96`, exercise-specific schemas (e.g., `fundamentals_01`, `joins_01`)
- **PostgreSQL 13**: Separate database `sql_training_13`, exercise-specific schemas, includes advanced window functions
- **Schema Creation**: Each exercise's seed.sql creates its own schema for isolation
- **SQLite**: Separate database files per exercise category

### SQL Execution Pattern
```javascript
// PostgreSQL with native parameterized queries
// Using $1, $2, etc. for parameters
const result = await pool.query(
  'SELECT * FROM users WHERE age >= $1 AND country = $2',
  [minAge, country]
);
return result.rows; // Array of objects

// PostgreSQL alternative: named parameters with pg-format (optional)
const result = await pool.query(
  'SELECT * FROM users WHERE age >= $1',
  [minAge]
);

// SQLite with native prepared statements
const stmt = db.prepare('SELECT * FROM users WHERE age >= ? AND country = ?');
const results = stmt.all(minAge, country); // Array of objects

// SQLite alternative: named parameters
const stmt = db.prepare('SELECT * FROM users WHERE age >= :minAge AND country = :country');
const results = stmt.all({ minAge: 25, country: 'USA' });
```

### Schema Isolation Example
Each exercise's seed.sql will create its own schema:
```sql
-- exercises/02-joins/01-inner-join/seed.sql
DROP SCHEMA IF EXISTS joins_01 CASCADE;
CREATE SCHEMA joins_01;
SET search_path TO joins_01;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total DECIMAL(10,2)
);

INSERT INTO users (name) VALUES ('Alice'), ('Bob');
INSERT INTO orders (user_id, total) VALUES (1, 100.00), (1, 200.00), (2, 150.00);
```

### Test Assertion Pattern
```javascript
it('should return correct results', async () => {
  const result = await executeSQL('./exercise.sql');

  expect(result).toHaveLength(5);
  expect(result[0]).toHaveProperty('id');
  expect(result[0].name).toBe('Alice');
  expect(result.every(r => r.age >= 25)).toBe(true);
});
```

## Success Criteria

1. **Functional**: All exercises execute correctly on target databases
2. **Educational**: Clear progression from basics to advanced concepts
3. **Practical**: Exercises reflect real interview questions
4. **Testable**: Comprehensive test coverage with clear assertions
5. **Maintainable**: Clean code structure, well-documented

## Deliverables

1. Working Docker environment with PostgreSQL 9.6 & 13
2. 10 exercise categories with basic implementations
3. Complete test suite using Vitest
4. Database connection libraries (no ORM)
5. SQL execution utilities
6. Claude agent configurations
7. Comprehensive documentation

## Notes

- Focus on practical SQL skills needed for interviews
- Exercises progress from basic SELECT to advanced window functions
- Version-specific features clearly marked
- No TypeScript - keep it simple with JavaScript
- Arrays of untyped objects for flexibility
- Native parameterized queries for SQL injection prevention