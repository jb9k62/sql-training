-- Aggregates: SUM and AVG with GROUP BY
--
-- TODO: Write a query that:
-- 1. Groups sales by region and product_category
-- 2. Calculates total sales amount per group (use SUM)
-- 3. Calculates average sales amount per group (use AVG)
-- 4. Returns: region, product_category, total_amount, and avg_amount columns
-- 5. Orders by region ascending, then by product_category ascending
--
-- WRITE YOUR QUERY HERE:
SELECT
  region,
  product_category,
  SUM(amount) AS total_amount,
  AVG(amount) AS avg_amount
FROM sales
GROUP BY region, product_category
ORDER BY region ASC, product_category ASC;
