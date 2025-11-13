# LEFT JOIN with Unmatched Records

**Difficulty:** Intermediate
**Databases:** PostgreSQL 13
**Time:** 12 minutes

## Learning Objectives

- Understand how LEFT JOIN works differently than INNER JOIN
- Keep all rows from the left table, even if there are no matches
- Handle NULL values in joined columns
- Recognize when LEFT JOIN vs INNER JOIN is appropriate
- Work with tables where not all records have relationships

## Instructions

Write a query to show all books along with their reviews, including books that haven't been reviewed yet.

You have two tables:
- **books**: Contains book information (id, title, author, publication_year)
- **reviews**: Contains book reviews (id, book_id, reviewer_name, rating, review_text, review_date)

Your task is to:
- Use LEFT JOIN to include all books, even those without reviews
- Display book title, author, reviewer name, and rating
- Books without reviews will show NULL in the reviewer columns
- Sort by book title alphabetically

## Table Structure

```sql
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
```

## Expected Output Structure (partial)

| title | author | reviewer_name | rating |
|-------|--------|---------------|--------|
| 1984 | George Orwell | Bob Johnson | 4 |
| 1984 | George Orwell | Diana Lee | 5 |
| Brave New World | Aldous Huxley | NULL | NULL |
| Jane Eyre | Charlotte Brontë | NULL | NULL |
| The Great Gatsby | F. Scott Fitzgerald | John Smith | 5 |
| The Great Gatsby | F. Scott Fitzgerald | Jane Doe | 5 |
| To Kill a Mockingbird | Harper Lee | Alice Brown | 5 |
| To Kill a Mockingbird | Harper Lee | Charlie Wilson | 4 |
| Wuthering Heights | Emily Brontë | NULL | NULL |

## Hints

1. LEFT JOIN keeps ALL rows from the left table (books in this case)
2. Use `LEFT JOIN reviews r ON b.id = r.book_id` to match records
3. When there's no matching review, reviewer_name and rating will be NULL
4. INNER JOIN would exclude books without reviews; LEFT JOIN includes them
5. Remember: LEFT JOIN = all left table rows + matching right table rows

## Testing Your Solution

Run the test file to validate your solution:
```bash
npm run test:exercise -- exercises/02-joins/02-left-join-unmatched/exercise.test.js
```

## Common Mistakes

- Using INNER JOIN instead of LEFT JOIN (you'll miss unreviewed books)
- Forgetting that some rows will have NULL values
- Not understanding the order of output (left table rows are preserved)
- Placing the WHERE clause incorrectly (it filters results after the join)
- Not aliasing tables, making the ON clause unclear
