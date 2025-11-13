-- Fundamentals: WHERE with Operators (BETWEEN, AND, OR)
--
-- TODO: Write a query that:
-- 1. Selects employees from Engineering or Sales departments
-- 2. With salaries between $70,000 and $90,000 (inclusive)
-- 3. Hired after January 1, 2021
-- 4. Returns: name, department, salary, hire_date columns
-- 5. Ordered by salary descending
--
-- WRITE YOUR QUERY HERE:
SELECT name, department, salary, hire_date
FROM employees
WHERE hire_date > '2021-01-01'
  -- AND department IN ('Engineering', 'Sales')
  AND (department = 'Engineering' OR department = 'Sales')
  AND salary BETWEEN 70000 AND 90000
ORDER BY salary DESC;
