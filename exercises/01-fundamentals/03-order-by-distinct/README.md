# ORDER BY and DISTINCT

**Difficulty:** Beginner
**Databases:** PostgreSQL 13
**Time:** 8 minutes

## Learning Objectives

- Use the DISTINCT keyword to remove duplicates
- Sort results with ORDER BY in ascending order
- Understand how DISTINCT affects query results
- Combine DISTINCT with ORDER BY

## Instructions

Write a query to find all unique product categories and display them in alphabetical order.

The products table contains 15 products across multiple categories. Your task is to:
- Get each category only once (no duplicates)
- Sort them alphabetically from A to Z

## Table Structure

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL,
  created_at DATE NOT NULL
);
```

## Expected Output Structure

| category |
|----------|
| Electronics |
| Furniture |

## Hints

1. Use DISTINCT to eliminate duplicate category values
2. Place DISTINCT right after SELECT
3. ORDER BY works with DISTINCT - put it at the end
4. ASC means ascending (A to Z), DESC means descending (Z to A)

## Testing Your Solution

Run the test file to validate your solution:
```bash
npm run test:exercise -- exercises/01-fundamentals/03-order-by-distinct/exercise.test.js
```

## Common Mistakes

- Forgetting the DISTINCT keyword (you'll get duplicates)
- Placing ORDER BY before WHERE (syntax error)
- Not realizing DISTINCT applies to all selected columns
- Using DESC instead of ASC when alphabetical order is requested
