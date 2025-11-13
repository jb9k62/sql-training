-- Joins: INNER JOIN Basics - Test Data

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  country VARCHAR(50) NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  product VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  order_date DATE NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO customers (id, name, email, country) VALUES
  (1, 'Alice Johnson', 'alice@example.com', 'USA'),
  (2, 'Bob Smith', 'bob@example.com', 'Canada'),
  (3, 'Carol Davis', 'carol@example.com', 'USA'),
  (4, 'David Wilson', 'david@example.com', 'UK'),
  (5, 'Emma Brown', 'emma@example.com', 'USA'),
  (6, 'Frank Miller', 'frank@example.com', 'Germany');

INSERT INTO orders (id, customer_id, product, quantity, order_date) VALUES
  (1, 1, 'Laptop', 1, '2024-01-15'),
  (2, 1, 'Mouse', 2, '2024-01-20'),
  (3, 3, 'Keyboard', 1, '2024-02-01'),
  (4, 2, 'Monitor', 1, '2024-02-05'),
  (5, 5, 'USB Cable', 5, '2024-02-10'),
  (6, 2, 'Desk Lamp', 1, '2024-02-15'),
  (7, 4, 'Chair', 1, '2024-03-01'),
  (8, 1, 'Monitor', 1, '2024-03-05');
