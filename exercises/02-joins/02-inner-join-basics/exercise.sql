-- Joins: INNER JOIN Basics
--
-- TODO: Write a query that:
-- 1. Joins customers and orders tables using customer_id
-- 2. Use INNER JOIN to match customer records with orders
-- 3. Returns: customer name, email, product name, and order date
-- 4. Filters to only show orders from USA-based customers
-- 5. Orders results by order_date ascending (oldest first)
--
-- WRITE YOUR QUERY HERE:
SELECT c.name, c.email, o.product, o.order_date
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'USA'
-- optiona ascending order
ORDER BY o.order_date ASC;
