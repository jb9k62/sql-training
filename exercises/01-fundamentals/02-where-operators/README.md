# WHERE with Operators (BETWEEN, AND, OR)

**Difficulty:** Beginner
**Databases:** PostgreSQL 13
**Time:** 10 minutes

## Learning Objectives

- Use the BETWEEN operator for range filtering
- Combine multiple conditions with AND/OR
- Understand operator precedence (AND vs OR)
- Filter results with complex WHERE clauses

## Instructions

Write a query to find employees that meet multiple criteria:
- Work in either Engineering or Sales departments
- Have a salary between $70,000 and $90,000 (inclusive)
- Were hired after January 1, 2021
- Display results sorted by salary (highest first)

## Table Structure

```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  salary INTEGER NOT NULL,
  hire_date DATE NOT NULL,
  manager_id INTEGER
);
```

## Expected Output Structure

| name | department | salary | hire_date |
|------|------------|--------|-----------|
| Frank Miller | Engineering | 92000 | 2020-06-12 |
| Jack Anderson | Engineering | 88000 | 2021-05-30 |
| Karen White | Sales | 71000 | 2022-08-15 |
| Henry Taylor | Sales | 72000 | 2020-09-20 |
| Emma Brown | Sales | 68000 | 2021-11-05 |

## Hints

1. Remember that BETWEEN is inclusive on both ends
2. Use parentheses to clarify OR conditions: `(dept = 'X' OR dept = 'Y')`
3. AND has higher precedence than OR, so structure carefully
4. Compare dates using `>` operator with date strings like '2021-01-01'

## Testing Your Solution

Run the test file to validate your solution:
```bash
npm run test:exercise -- exercises/01-fundamentals/02-where-operators/exercise.test.js
```

## Common Mistakes

- Forgetting parentheses around OR conditions, leading to incorrect logic
- Using `salary BETWEEN 70000 AND 90000` but forgetting the salary AND department filter won't work correctly without proper precedence
- Comparing dates incorrectly (remember DATE format)
- Missing the hire_date filter entirely
