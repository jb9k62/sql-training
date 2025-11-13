# SUM and AVG with GROUP BY

**Difficulty:** Intermediate
**Databases:** PostgreSQL 13
**Time:** 12 minutes

## Learning Objectives

- Use SUM() to calculate total values
- Use AVG() to calculate average values
- Group by multiple columns
- Combine multiple aggregate functions in one query
- Understand how grouping works with multiple dimensions

## Instructions

Write a query to analyze sales data by region and product category.

You have a sales table with individual transactions. Your task is to:
- Group sales by region AND product category (multiple GROUP BY columns)
- Calculate the total sales amount for each group
- Calculate the average sales amount for each group
- Display results sorted by region first, then by product category
- Alias columns as `total_amount` and `avg_amount`

## Table Structure

```sql
CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  sales_person VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  product_category VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  sale_date DATE NOT NULL
);
```

## Expected Output Structure

| region | product_category | total_amount | avg_amount |
|--------|-----------------|--------------|-----------|
| East | Electronics | 1100.00 | 1100.00 |
| East | Furniture | 4300.00 | 2150.00 |
| North | Electronics | 3500.00 | 1166.67 |
| North | Furniture | 5200.00 | 2600.00 |
| South | Electronics | 2000.00 | 1000.00 |
| South | Furniture | 6300.00 | 3150.00 |
| West | Electronics | 2200.00 | 1100.00 |
| West | Furniture | 2200.00 | 2200.00 |

## Hints

1. Use `GROUP BY region, product_category` for grouping by multiple columns
2. `SUM(amount)` adds up all amounts in each group
3. `AVG(amount)` calculates the average for each group
4. All non-aggregated columns in SELECT must be in GROUP BY
5. Remember: GROUP BY comes after FROM/WHERE, ORDER BY comes last
6. When grouping by multiple columns, order them consistently in both GROUP BY and ORDER BY

## Testing Your Solution

Run the test file to validate your solution:
```bash
npm run test:exercise -- exercises/03-aggregates/02-sum-avg-group-by/exercise.test.js
```

## Common Mistakes

- Forgetting one of the GROUP BY columns (query will return wrong groups)
- Selecting columns that aren't aggregated and not in GROUP BY (most databases will error)
- Not aliasing aggregate functions (hard to identify which column is which)
- Placing aggregate functions in WHERE (use HAVING instead to filter groups)
- Forgetting to order by the correct columns
- Not including all GROUP BY columns in the ORDER BY to match expected sort order
