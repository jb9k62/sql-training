-- Solution: INNER JOIN - Orders and Users
--
-- NOTE: The 'total' column is DECIMAL(10,2) which in PostgreSQL returns as a string
-- when queried from JavaScript/Node.js. Example: 250.00 becomes '250.00'.
-- Use parseFloat() when comparing DECIMAL values in test assertions.

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

-- SELECT
--   user.name,
--   user.email,
--   order.id as order_id,
--   order.order_date,
--   order.total
-- FROM users user
-- INNER JOIN orders order ON user.id = order.user_id;
