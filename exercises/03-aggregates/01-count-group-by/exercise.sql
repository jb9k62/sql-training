-- Aggregates: COUNT and GROUP BY
--
-- TODO: Write a query that:
-- 1. Groups test scores by student name
-- 2. Counts how many tests each student has taken
-- 3. Returns: student_name and the count of tests (as test_count)
-- 4. Orders by test_count descending (most tests first)
-- 5. Filters to only students with more than 2 tests
--
-- WRITE YOUR QUERY HERE:
SELECT
  student_name,
  COUNT(*) AS test_count
FROM test_scores
GROUP BY student_name
HAVING COUNT(*) > 2
ORDER BY test_count DESC;
