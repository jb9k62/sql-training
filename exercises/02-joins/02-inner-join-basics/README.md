# INNER JOIN Basics

**Difficulty:** Intermediate
**Databases:** PostgreSQL 13
**Time:** 12 minutes

## Learning Objectives

- Understand how INNER JOIN works
- Join two tables using a foreign key relationship
- Use table aliases (AS or shorthand)
- Combine JOINs with WHERE filtering
- Understand that INNER JOIN only returns matching records

## Instructions

Write a query to find all orders placed by USA-based customers.

You have two tables:
- **customers**: Contains customer information (id, name, email, country)
- **orders**: Contains order information (id, customer_id, product, quantity, order_date)

Your task is to:
- Match customers with their orders using INNER JOIN
- Only show customers from the USA
- Display customer name, email, product ordered, and order date
- Sort by order date (oldest first)

## Table Structure

```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  country VARCHAR(50) NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  product VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  order_date DATE NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

## Expected Output Structure

| name | email | product | order_date |
|------|-------|---------|-----------|
| Alice Johnson | alice@example.com | Laptop | 2024-01-15 |
| Alice Johnson | alice@example.com | Mouse | 2024-01-20 |
| Carol Davis | carol@example.com | Keyboard | 2024-02-01 |
| Emma Brown | emma@example.com | USB Cable | 2024-02-10 |

## Hints

1. Use table aliases: `FROM customers c` to shorten column references
2. Use `c.id = o.customer_id` in the ON clause to match records
3. INNER JOIN only returns rows where the join condition is true
4. WHERE filters are applied after the join
5. Remember: `FROM customers c INNER JOIN orders o ON c.id = o.customer_id`

## Testing Your Solution

Run the test file to validate your solution:
```bash
npm run test:exercise -- exercises/02-joins/01-inner-join-basics/exercise.test.js
```

## Common Mistakes

- Forgetting the ON clause in the JOIN
- Using the wrong column for joining (should be customer_id)
- Placing WHERE before the JOIN instead of after
- Forgetting table aliases makes column references ambiguous
- Forgetting to filter by country = 'USA'
