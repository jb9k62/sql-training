-- Joins: LEFT JOIN with Unmatched Records - Test Data

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  publication_year INTEGER NOT NULL
);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL,
  reviewer_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL,
  review_text VARCHAR(500),
  review_date DATE NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

INSERT INTO books (id, title, author, publication_year) VALUES
  (1, 'The Great Gatsby', 'F. Scott Fitzgerald', 1925),
  (2, '1984', 'George Orwell', 1949),
  (3, 'To Kill a Mockingbird', 'Harper Lee', 1960),
  (4, 'Brave New World', 'Aldous Huxley', 1932),
  (5, 'Jane Eyre', 'Charlotte Brontë', 1847),
  (6, 'Wuthering Heights', 'Emily Brontë', 1848);

INSERT INTO reviews (id, book_id, reviewer_name, rating, review_text, review_date) VALUES
  (1, 1, 'John Smith', 5, 'A masterpiece of American literature', '2024-01-10'),
  (2, 1, 'Jane Doe', 5, 'Beautifully written', '2024-01-15'),
  (3, 2, 'Bob Johnson', 4, 'Thought-provoking and chilling', '2024-02-01'),
  (4, 3, 'Alice Brown', 5, 'Timeless classic', '2024-02-05'),
  (5, 3, 'Charlie Wilson', 4, 'Powerful story about morality', '2024-02-10'),
  (6, 2, 'Diana Lee', 5, 'Still relevant today', '2024-02-15');
