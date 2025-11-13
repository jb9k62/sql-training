-- Aggregates: COUNT and GROUP BY - Test Data

DROP TABLE IF EXISTS test_scores;

CREATE TABLE test_scores (
  id INTEGER PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  test_date DATE NOT NULL
);

INSERT INTO test_scores (id, student_name, subject, score, test_date) VALUES
  (1, 'Alice Johnson', 'Math', 95, '2024-01-10'),
  (2, 'Alice Johnson', 'Science', 88, '2024-01-15'),
  (3, 'Alice Johnson', 'English', 92, '2024-01-20'),
  (4, 'Bob Smith', 'Math', 78, '2024-01-10'),
  (5, 'Bob Smith', 'Science', 82, '2024-01-15'),
  (6, 'Bob Smith', 'English', 85, '2024-01-20'),
  (7, 'Carol Davis', 'Math', 88, '2024-01-10'),
  (8, 'Carol Davis', 'Science', 91, '2024-01-15'),
  (9, 'Carol Davis', 'English', 87, '2024-01-20'),
  (10, 'David Wilson', 'Math', 92, '2024-01-10'),
  (11, 'David Wilson', 'Science', 85, '2024-01-15'),
  (12, 'David Wilson', 'English', 90, '2024-01-20'),
  (13, 'Emma Brown', 'Math', 86, '2024-01-10'),
  (14, 'Emma Brown', 'Science', 93, '2024-01-15'),
  (15, 'Emma Brown', 'English', 89, '2024-01-20');
