-- Solution: SUM and AVG with GROUP BY

SELECT
  region,
  product_category,
  SUM(amount) AS total_amount,
  AVG(amount) AS avg_amount
FROM sales
GROUP BY region, product_category
ORDER BY region ASC, product_category ASC;
