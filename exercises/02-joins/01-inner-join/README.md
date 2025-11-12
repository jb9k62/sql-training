# INNER JOIN - Orders and Users

**Difficulty:** Beginner-Intermediate
**Databases:** PostgreSQL 9.6, PostgreSQL 13, SQLite
**Time:** 15 minutes

## Learning Objectives

- Understand INNER JOIN syntax
- Join tables on foreign key relationships
- Select columns from multiple tables
- Apply WHERE conditions on joined data
- Use table aliases for cleaner queries

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
users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255)
)

orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  order_date DATE,
  total DECIMAL(10,2),
  status VARCHAR(20)
)
```

## Expected Output

```
name        | email                | order_id | order_date | total
------------|---------------------|----------|------------|--------
Alice Brown | alice@example.com   | 5        | 2024-06-15 | 250.00
Bob Smith   | bob@example.com     | 3        | 2024-06-10 | 150.00
...
```

## Hints

- Use `INNER JOIN orders ON users.id = orders.user_id`
- Use table aliases (e.g., `users u`, `orders o`) for cleaner code
- Filter with `WHERE o.total > 100`
- Remember to use the correct table prefix for columns

## Common Mistakes

- Forgetting to specify which table a column comes from
- Using WHERE instead of ON for the join condition
- Not using table aliases when column names are ambiguous

## Testing Your Solution

```bash
npm test exercises/02-joins/01-inner-join
```