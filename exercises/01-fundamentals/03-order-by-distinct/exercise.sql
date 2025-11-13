-- Fundamentals: ORDER BY and DISTINCT
--
-- TODO: Write a query that:
-- 1. Selects all unique categories from the products table
-- 2. Returns each category only once (use DISTINCT)
-- 3. Orders results alphabetically (A to Z)
--
-- WRITE YOUR QUERY HERE:
SELECT DISTINCT category
FROM products
ORDER BY category ASC;
