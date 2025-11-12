-- Seed data for INNER JOIN exercise
-- Works for both PostgreSQL and SQLite

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  order_date DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (id, name, email) VALUES
  (1, 'Alice Brown', 'alice@example.com'),
  (2, 'Bob Smith', 'bob@example.com'),
  (3, 'Charlie Davis', 'charlie@example.com'),
  (4, 'Diana Wilson', 'diana@example.com'),
  (5, 'Edward Jones', 'edward@example.com');

INSERT INTO orders (id, user_id, order_date, total, status) VALUES
  (1, 1, '2024-06-01', 50.00, 'completed'),
  (2, 1, '2024-06-15', 250.00, 'completed'),
  (3, 2, '2024-06-10', 150.00, 'completed'),
  (4, 3, '2024-06-05', 75.00, 'pending'),
  (5, 2, '2024-05-20', 200.00, 'completed'),
  (6, 4, '2024-06-08', 125.00, 'completed'),
  (7, 1, '2024-06-20', 300.00, 'pending'),
  (8, 3, '2024-06-12', 90.00, 'completed'),
  (9, 5, '2024-06-18', 175.00, 'completed'),
  (10, 2, '2024-06-22', 60.00, 'completed');