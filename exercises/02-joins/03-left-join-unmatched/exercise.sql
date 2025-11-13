-- Joins: LEFT JOIN with Unmatched Records
--
-- TODO: Write a query that:
-- 1. Joins books and reviews tables
-- 2. Use LEFT JOIN to keep all books, even those without reviews
-- 3. Returns: book title, author, reviewer_name, and rating
-- 4. Ordered by book title alphabetically
-- 5. Note: Books without reviews will have NULL values in reviewer columns
--
-- WRITE YOUR QUERY HERE:
SELECT b.title, b.author, r.reviewer_name, r.rating
FROM books b
LEFT JOIN reviews r ON r.book_id = b.id
ORDER BY b.title ASC;
