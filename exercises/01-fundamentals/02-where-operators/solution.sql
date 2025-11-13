-- Solution: WHERE with Operators (BETWEEN, AND, OR)

SELECT
  name,
  department,
  salary,
  hire_date
FROM employees
WHERE (department = 'Engineering' OR department = 'Sales')
  AND salary BETWEEN 70000 AND 90000
  AND hire_date > '2021-01-01'
ORDER BY salary DESC;
