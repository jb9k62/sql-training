-- Fundamentals: WHERE with Operators - Test Data

DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  salary INTEGER NOT NULL,
  hire_date DATE NOT NULL,
  manager_id INTEGER
);

INSERT INTO employees (id, name, department, salary, hire_date, manager_id) VALUES
  (1, 'Alice Johnson', 'Engineering', 95000, '2020-01-15', NULL),
  (2, 'Bob Smith', 'Sales', 65000, '2021-03-22', 1),
  (3, 'Carol Davis', 'Engineering', 85000, '2019-07-10', 1),
  (4, 'David Wilson', 'Marketing', 70000, '2022-01-08', NULL),
  (5, 'Emma Brown', 'Sales', 68000, '2021-11-05', 2),
  (6, 'Frank Miller', 'Engineering', 92000, '2020-06-12', 1),
  (7, 'Grace Lee', 'HR', 60000, '2023-02-14', NULL),
  (8, 'Henry Taylor', 'Sales', 72000, '2020-09-20', 2),
  (9, 'Iris Martinez', 'Marketing', 75000, '2022-04-01', 4),
  (10, 'Jack Anderson', 'Engineering', 88000, '2021-05-30', 1),
  (11, 'Karen White', 'Sales', 71000, '2022-08-15', 2),
  (12, 'Leo Garcia', 'HR', 58000, '2023-06-01', 7),
  (13, 'Megan Clark', 'Engineering', 90000, '2021-02-28', 1),
  (14, 'Nathan Young', 'Marketing', 73000, '2023-01-10', 4),
  (15, 'Olivia Green', 'Sales', 69000, '2022-10-12', 2);
