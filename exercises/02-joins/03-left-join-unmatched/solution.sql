-- Solution: LEFT JOIN with Unmatched Records

SELECT
  b.title,
  b.author,
  r.reviewer_name,
  r.rating
FROM books b
LEFT JOIN reviews r ON b.id = r.book_id
ORDER BY b.title ASC;
