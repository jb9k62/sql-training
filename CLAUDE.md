# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SQL Training Environment - A comprehensive PostgreSQL and SQLite training platform designed for senior engineering interview preparation with direct SQL execution and Vitest testing framework.

## Build and Test Commands

### Essential Development Commands

```bash
# Initial setup (required first time)
npm install
npm run setup  # Starts Docker containers and initializes databases

# Running tests
npm test                        # Run all tests with default database
npm run test:watch             # Watch mode for continuous testing
npm run test:exercise -- path/to/exercise.test.js  # Run specific test file

# Database-specific testing
npm run test:pg13              # Test against PostgreSQL 13 (default)
npm run test:pg96              # Test against PostgreSQL 9.6
npm run test:sqlite            # Test against SQLite
npm run test:all               # Run tests on all databases sequentially

# Docker management
npm run docker:up              # Start PostgreSQL containers
npm run docker:down            # Stop containers
npm run docker:restart         # Restart containers
npm run docker:logs            # View container logs

# Database initialization
npm run db:init                # Initialize database schemas (after containers are running)
```

### Running a Single Test

```bash
# Run a specific test file
npx vitest run exercises/01-fundamentals/01-basic-select/exercise.test.js

# Run with specific database
DATABASE=sqlite npx vitest run exercises/01-fundamentals/01-basic-select/exercise.test.js
```

## Architecture Overview

### Core Database Abstraction Layer

The system uses a unified `SqlExecutor` class (`src/utils/sql-executor.js`) that abstracts database differences:
- Handles PostgreSQL 9.6, PostgreSQL 13, and SQLite transparently
- Manages schema creation and isolation for PostgreSQL
- Provides consistent result format across all databases
- Supports both raw SQL and parameterized queries

### Test Framework Design

Each exercise follows a consistent structure:
- `seed.sql`: Creates schema (PostgreSQL) and tables with test data
- `exercise.sql`: Student template with SQL to complete
- `solution.sql`: Reference implementation
- `exercise.test.js`: Test specifications using custom assertions
- Tests run in isolated schemas to prevent interference

### Database Connection Architecture

```javascript
// PostgreSQL connections use pools (src/db/postgres.js)
// SQLite uses synchronous execution (src/db/sqlite.js)
// SqlExecutor provides unified interface:
const executor = new SqlExecutor(database, schema);
await executor.executeFile('./exercise.sql');
await executor.executeWithParams('SELECT * FROM users WHERE id = $1', [userId]);
```

### Custom Test Assertions

The framework provides specialized SQL testing assertions (`src/utils/test-helpers.js`):
- `expectRowCount(result, count)`: Verify number of returned rows
- `expectColumns(result, ['col1', 'col2'])`: Check column existence
- `expectOrdered(result, 'column', 'asc'|'desc')`: Verify sort order
- `expectNoNulls(result, 'column')`: Ensure no null values
- `expectUnique(result, 'column')`: Check for uniqueness
- `compareSolutions(executor, exercisePath, solutionPath)`: Compare results

## Database Configuration

Environment variables control database connections (`.env`):
- `DATABASE`: Default test database (pg13, pg96, or sqlite)
- PostgreSQL runs in Docker containers on ports 5432 (9.6) and 5433 (13)
- SQLite databases are created in `data/` directory
- Each exercise uses isolated schemas to prevent data conflicts

## Exercise Development Pattern

When creating or modifying exercises:

1. PostgreSQL seed files must create and use schemas:
```sql
DROP SCHEMA IF EXISTS exercise_name CASCADE;
CREATE SCHEMA exercise_name;
SET search_path TO exercise_name;
```

2. Test files should support multiple databases:
```javascript
const DATABASES = ['pg13', 'pg96', 'sqlite'];  // or subset
describe.each(DATABASES)('%s: Exercise Name', (database) => {
  // test implementation
});
```

3. Handle database-specific SQL differences:
- PostgreSQL: `SERIAL` for auto-increment
- SQLite: `INTEGER PRIMARY KEY` for auto-increment
- PostgreSQL: `INSERT ON CONFLICT` for upsert
- SQLite: `REPLACE INTO` for upsert

## Testing Workflow

1. Tests run sequentially (`threads: false` in vitest.config.js) to avoid database conflicts
2. Each test creates its schema, seeds data, runs the exercise, and validates results
3. Schemas are not automatically dropped after tests to allow debugging
4. Use `npm run docker:logs` to debug PostgreSQL connection issues
5. SQLite databases persist in `data/` directory for inspection

## Common Troubleshooting

- **Connection refused**: Ensure Docker containers are running (`npm run docker:up`)
- **Schema not found**: Check that seed.sql creates the schema for PostgreSQL
- **Test timeout**: Default timeout is 30 seconds, may need adjustment for complex queries
- **SQLite file locked**: Ensure no other process is accessing the database file