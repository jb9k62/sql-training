-- Solution: INNER JOIN - Orders and Users

SELECT
  u.name,
  u.email,
  o.id as order_id,
  o.order_date,
  o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.total > 100
ORDER BY o.order_date DESC;