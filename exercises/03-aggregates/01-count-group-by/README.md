# COUNT and GROUP BY

**Difficulty:** Intermediate
**Databases:** PostgreSQL 13
**Time:** 12 minutes

## Learning Objectives

- Use the COUNT() aggregate function
- Group rows using GROUP BY
- Use HAVING clause to filter grouped results
- Understand the difference between WHERE and HAVING
- Calculate counts for grouped data

## Instructions

Write a query to count how many tests each student has taken.

You have a table with test scores for multiple students across different subjects. Your task is to:
- Group records by student name
- Count how many test scores each student has
- Only show students with more than 2 tests
- Display results sorted by count (most tests first)
- Alias the count column as `test_count`

## Table Structure

```sql
CREATE TABLE test_scores (
  id INTEGER PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  test_date DATE NOT NULL
);
```

## Expected Output Structure

| student_name | test_count |
|--------------|-----------|
| Alice Johnson | 3 |
| Bob Smith | 3 |
| Carol Davis | 3 |
| David Wilson | 3 |
| Emma Brown | 3 |

## Hints

1. Use `COUNT(*)` to count all rows in each group
2. GROUP BY student_name to group results
3. HAVING filters groups (after grouping), WHERE filters rows (before grouping)
4. Use `AS test_count` to rename the COUNT(*) column
5. Remember: HAVING comes after GROUP BY, ORDER BY comes last

## Testing Your Solution

Run the test file to validate your solution:
```bash
npm run test:exercise -- exercises/03-aggregates/01-count-group-by/exercise.test.js
```

## Common Mistakes

- Forgetting the GROUP BY clause (query will fail or return wrong results)
- Using WHERE instead of HAVING to filter groups (WHERE filters rows, HAVING filters groups)
- Not aliasing the COUNT(*) column with AS
- Placing HAVING before GROUP BY (syntax error)
- Forgetting to use COUNT(*) and just selecting student_name
