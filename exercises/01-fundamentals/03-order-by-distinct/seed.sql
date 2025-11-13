-- Fundamentals: ORDER BY and DISTINCT - Test Data

DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL,
  created_at DATE NOT NULL
);

INSERT INTO products (id, name, category, price, stock_quantity, created_at) VALUES
  (1, 'Laptop Pro', 'Electronics', 1299.99, 5, '2024-01-10'),
  (2, 'USB-C Cable', 'Electronics', 9.99, 150, '2024-01-15'),
  (3, 'Office Chair', 'Furniture', 249.00, 12, '2024-02-01'),
  (4, 'Desk Lamp', 'Furniture', 45.00, 30, '2024-02-05'),
  (5, 'Wireless Mouse', 'Electronics', 29.99, 80, '2024-02-10'),
  (6, 'Keyboard', 'Electronics', 89.99, 40, '2024-02-15'),
  (7, 'Monitor Stand', 'Furniture', 35.00, 25, '2024-03-01'),
  (8, 'USB Hub', 'Electronics', 24.99, 100, '2024-03-05'),
  (9, 'Desk Organizer', 'Furniture', 19.99, 60, '2024-03-10'),
  (10, 'External SSD', 'Electronics', 149.99, 20, '2024-03-15'),
  (11, 'File Cabinet', 'Furniture', 199.00, 8, '2024-03-20'),
  (12, 'Monitor', 'Electronics', 399.00, 10, '2024-04-01'),
  (13, 'Desk', 'Furniture', 599.00, 6, '2024-04-05'),
  (14, 'Power Bank', 'Electronics', 49.99, 70, '2024-04-10'),
  (15, 'Bookshelf', 'Furniture', 129.00, 15, '2024-04-15');
