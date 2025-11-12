# Basic SELECT with Filtering

**Difficulty:** Beginner
**Databases:** PostgreSQL 9.6, PostgreSQL 13, SQLite
**Time:** 10 minutes

## Learning Objectives

- Write basic SELECT statements
- Filter results using WHERE clause
- Sort results with ORDER BY
- Limit results with LIMIT/OFFSET
- Use IN operator for multiple values

## Instructions

You have a `users` table with customer information. Write a SQL query that:

1. Selects users who registered after January 1, 2024
2. Only includes users from 'USA' or 'Canada'
3. Returns name, email, country, and created_at columns
4. Orders results by created_at descending (newest first)
5. Limits to 10 results

## Table Structure

```sql
users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255),
  country VARCHAR(50),
  age INTEGER,
  created_at DATE
)
```

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
- The ORDER BY clause comes before LIMIT

## Testing Your Solution

To test your solution:

1. Edit the `exercise.sql` file
2. Run the tests:
   ```bash
   npm test exercises/01-fundamentals/01-basic-select
   ```

## Common Mistakes

- Forgetting to include all required columns
- Using wrong date format (use YYYY-MM-DD)
- Putting LIMIT before ORDER BY
- Using OR instead of IN for multiple values