# SQL Training Environment

A comprehensive SQL training environment for senior engineering interview preparation, featuring PostgreSQL (9.6 & 13) and SQLite with raw SQL execution and Vitest testing framework.

## Features

- **Multi-database support**: PostgreSQL 9.6, PostgreSQL 13, and SQLite
- **Schema isolation**: Each exercise has its own schema for clean separation
- **No ORM**: Direct SQL execution for authentic interview preparation
- **Comprehensive testing**: Custom assertions and test helpers with Vitest
- **Version-specific features**: Learn differences between database versions
- **Progressive difficulty**: From basic SELECT to advanced window functions

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sql-training
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Start Docker containers and initialize databases:
```bash
npm run setup
```

This command will:
- Start PostgreSQL 9.6 and 13 containers
- Wait for databases to be ready
- Initialize database schemas

## Project Structure

```
sql-training/
├── docker/                    # Docker configuration
│   └── docker-compose.yml    # PostgreSQL containers
├── src/
│   ├── db/                   # Database connection layers
│   │   ├── postgres.js       # PostgreSQL pools
│   │   └── sqlite.js         # SQLite helpers
│   ├── utils/
│   │   ├── sql-executor.js   # SQL execution utility
│   │   └── test-helpers.js   # Custom test assertions
│   ├── scripts/
│   │   ├── wait-for-db.js    # Database readiness check
│   │   └── init-databases.js # Schema initialization
│   └── setup/
│       └── test-setup.js      # Vitest global setup
├── exercises/                 # Training exercises
│   ├── 01-fundamentals/      # Basic SQL concepts
│   ├── 02-joins/             # Table relationships
│   ├── 03-aggregates/        # GROUP BY and aggregation
│   ├── 04-functions/         # Built-in functions
│   ├── 05-subqueries/        # Nested queries
│   ├── 06-ctes/              # Common Table Expressions
│   ├── 07-window-functions/  # Advanced analytics (PostgreSQL)
│   ├── 08-upsert/            # INSERT ON CONFLICT
│   ├── 09-json/              # JSON operations (PostgreSQL)
│   └── 10-performance/       # Query optimization
├── data/                      # SQLite database files
├── .env.example              # Environment template
├── package.json              # Dependencies
└── vitest.config.js          # Test configuration
```

## Available Commands

### Docker Management
```bash
npm run docker:up      # Start PostgreSQL containers
npm run docker:down    # Stop containers
npm run docker:restart # Restart containers
npm run docker:logs    # View container logs
```

### Testing
```bash
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:pg96      # Test PostgreSQL 9.6 only
npm run test:pg13      # Test PostgreSQL 13 only
npm run test:sqlite    # Test SQLite only
npm run test:all       # Run tests on all databases sequentially
```

### Database Management
```bash
npm run db:wait        # Wait for databases to be ready
npm run db:init        # Initialize database schemas
npm run setup          # Complete setup (docker:up + db:wait + db:init)
```

## Exercise Structure

Each exercise contains:

- **README.md** - Instructions and learning objectives
- **seed.sql** - Test data setup (with schema creation for PostgreSQL)
- **exercise.sql** - Student template with TODOs
- **solution.sql** - Complete answer
- **exercise.test.js** - Test specifications

### Example Exercise

```javascript
// exercises/01-fundamentals/01-basic-select/exercise.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { SqlExecutor } from '@/utils/sql-executor.js';
import { expectRowCount, expectColumns } from '@/utils/test-helpers.js';

describe('Basic SELECT', () => {
  let executor;

  beforeAll(async () => {
    executor = new SqlExecutor('pg13', 'fundamentals_01');
    await executor.seed('./seed.sql');
  });

  it('should return correct number of rows', async () => {
    const result = await executor.executeFile('./exercise.sql');
    expectRowCount(result, 5);
  });
});
```

## Database Connection Examples

### PostgreSQL with Parameterized Queries
```javascript
import { queryPg13 } from './src/db/postgres.js';

// Safe parameterized query (prevents SQL injection)
const result = await queryPg13(
  'SELECT * FROM users WHERE age > $1 AND country = $2',
  [25, 'USA']
);
```

### SQLite with Named Parameters
```javascript
import { query } from './src/db/sqlite.js';

// Named parameters for better readability
const result = query(
  'SELECT * FROM users WHERE age > :minAge AND country = :country',
  { minAge: 25, country: 'USA' }
);
```

## Custom Test Assertions

```javascript
import {
  expectRowCount,
  expectColumns,
  expectOrdered,
  expectNoNulls,
  expectUnique
} from '@/utils/test-helpers.js';

// Assert row count
expectRowCount(result, 10);

// Assert columns exist
expectColumns(result, ['id', 'name', 'email']);

// Assert ordering
expectOrdered(result, 'created_at', 'desc');

// Assert no nulls
expectNoNulls(result, 'email');

// Assert unique values
expectUnique(result, 'id');
```

## Database Version Differences

| Feature | PostgreSQL | SQLite |
|---------|------------|---------|
| Schemas | ✅ CREATE SCHEMA | ❌ |
| Auto-increment | SERIAL | INTEGER PRIMARY KEY |
| UPSERT | INSERT ON CONFLICT | REPLACE INTO |
| JSON | JSON/JSONB types | JSON functions |
| Window Functions | Full support | Limited (3.25+) |
| CTEs | WITH RECURSIVE | WITH (limited) |

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# PostgreSQL 9.6
PG96_HOST=localhost
PG96_PORT=5432
PG96_DB=sql_training_96

# PostgreSQL 13
PG13_HOST=localhost
PG13_PORT=5433
PG13_DB=sql_training_13

# Shared credentials
PG_USER=sqltraining
PG_PASSWORD=training123

# Default test database
DATABASE=pg13
```

## Troubleshooting

### Connection Refused
```bash
# Check if containers are running
docker ps

# Restart containers
npm run docker:restart

# View logs
npm run docker:logs
```

### Database Not Found
```bash
# Check database exists
docker exec -it sql-training-postgres13-1 psql -U sqltraining -c "\l"

# Reinitialize databases
npm run db:init
```

### Schema Not Found
Ensure each exercise's seed.sql creates its schema:
```sql
DROP SCHEMA IF EXISTS exercise_name CASCADE;
CREATE SCHEMA exercise_name;
SET search_path TO exercise_name;
```

## Contributing

1. Create exercises in appropriate category folder
2. Follow the exercise template structure
3. Test on all target databases
4. Include clear README with learning objectives
5. Add comprehensive test assertions

## License

MIT