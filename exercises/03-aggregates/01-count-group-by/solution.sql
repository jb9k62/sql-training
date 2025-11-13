-- Solution: COUNT and GROUP BY

SELECT
  student_name,
  COUNT(*) AS test_count
FROM test_scores
GROUP BY student_name
HAVING COUNT(*) > 2
ORDER BY test_count DESC;
