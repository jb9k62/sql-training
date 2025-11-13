-- Solution: INNER JOIN Basics

SELECT
  c.name,
  c.email,
  o.product,
  o.order_date
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
WHERE c.country = 'USA'
ORDER BY o.order_date ASC;
