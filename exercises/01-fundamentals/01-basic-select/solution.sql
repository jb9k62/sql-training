-- Solution: Basic SELECT with Filtering

SELECT
  name,
  email,
  country,
  created_at
FROM users
WHERE created_at > '2024-01-01'
  AND country IN ('USA', 'Canada')
ORDER BY created_at DESC
LIMIT 10;