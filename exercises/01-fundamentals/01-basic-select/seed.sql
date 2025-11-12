-- This seed file works for both PostgreSQL and SQLite with conditional handling

-- PostgreSQL: Create schema (handled by test setup)
-- SQLite: No schema support

-- Drop and create users table
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  country VARCHAR(50),
  age INTEGER,
  created_at DATE NOT NULL
);

-- Insert test data
INSERT INTO users (id, name, email, country, age, created_at) VALUES
  (1, 'John Smith', 'john@example.com', 'USA', 35, '2024-06-15'),
  (2, 'Jane Doe', 'jane@example.com', 'Canada', 28, '2024-06-10'),
  (3, 'Bob Johnson', 'bob@example.com', 'USA', 42, '2024-05-20'),
  (4, 'Alice Brown', 'alice@example.com', 'UK', 31, '2024-04-15'),
  (5, 'Charlie Wilson', 'charlie@example.com', 'Canada', 29, '2024-03-10'),
  (6, 'Diana Prince', 'diana@example.com', 'USA', 33, '2024-02-28'),
  (7, 'Eve Adams', 'eve@example.com', 'Australia', 27, '2024-01-15'),
  (8, 'Frank Miller', 'frank@example.com', 'Canada', 38, '2024-07-01'),
  (9, 'Grace Lee', 'grace@example.com', 'USA', 26, '2024-06-25'),
  (10, 'Henry Ford', 'henry@example.com', 'UK', 45, '2023-12-20'),
  (11, 'Iris West', 'iris@example.com', 'USA', 30, '2024-05-05'),
  (12, 'Jack Ryan', 'jack@example.com', 'Canada', 41, '2024-04-20'),
  (13, 'Kate Morgan', 'kate@example.com', 'USA', 29, '2023-11-15'),
  (14, 'Leo King', 'leo@example.com', 'Canada', 34, '2024-01-05'),
  (15, 'Maria Garcia', 'maria@example.com', 'Mexico', 31, '2024-06-01');