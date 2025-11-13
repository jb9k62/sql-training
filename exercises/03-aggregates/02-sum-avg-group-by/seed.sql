-- Aggregates: SUM and AVG with GROUP BY - Test Data

DROP TABLE IF EXISTS sales;

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  sales_person VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  product_category VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  sale_date DATE NOT NULL
);

INSERT INTO sales (id, sales_person, region, product_category, amount, sale_date) VALUES
  (1, 'John Smith', 'North', 'Electronics', 1500.00, '2024-01-05'),
  (2, 'John Smith', 'North', 'Furniture', 2000.00, '2024-01-10'),
  (3, 'John Smith', 'North', 'Electronics', 950.00, '2024-01-15'),
  (4, 'Sarah Jones', 'South', 'Electronics', 1200.00, '2024-01-07'),
  (5, 'Sarah Jones', 'South', 'Furniture', 3500.00, '2024-01-12'),
  (6, 'Sarah Jones', 'South', 'Electronics', 800.00, '2024-01-18'),
  (7, 'Mike Davis', 'East', 'Furniture', 2500.00, '2024-01-08'),
  (8, 'Mike Davis', 'East', 'Electronics', 1100.00, '2024-01-14'),
  (9, 'Mike Davis', 'East', 'Furniture', 1800.00, '2024-01-20'),
  (10, 'Lisa Anderson', 'West', 'Electronics', 1300.00, '2024-01-06'),
  (11, 'Lisa Anderson', 'West', 'Furniture', 2200.00, '2024-01-11'),
  (12, 'Lisa Anderson', 'West', 'Electronics', 900.00, '2024-01-17'),
  (13, 'Tom Wilson', 'North', 'Furniture', 3200.00, '2024-01-09'),
  (14, 'Tom Wilson', 'North', 'Electronics', 1050.00, '2024-01-16'),
  (15, 'Emma Taylor', 'South', 'Furniture', 2800.00, '2024-01-13');
