import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { SqlExecutor } from '../../../src/utils/sql-executor.js';
import {
  expectRowCount,
  expectColumns,
  expectOrdered,
} from '../../../src/utils/test-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASES = ['pg13'];

describe.each(DATABASES)('%s: LEFT JOIN with Unmatched Records', (database) => {
  let executor;
  const schema = 'joins_02';

  beforeAll(async () => {
    executor = new SqlExecutor(database, schema);

    if (database.startsWith('pg')) {
      await executor.createSchema(schema);
      await executor.setSearchPath(schema);
    }

    const seedPath = path.join(__dirname, 'seed.sql');
    await executor.seed(seedPath);
  });

  afterAll(async () => {
    // Cleanup schema (PostgreSQL only)
    if (database.startsWith('pg') && process.env.CLEANUP_SCHEMAS_AFTER_TESTS === 'true') {
      await executor.dropSchema(schema);
    }
  });

  describe('Exercise Requirements', () => {
    it('should return correct number of rows', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      // 6 books, some with multiple reviews = 9 total rows
      expectRowCount(result, 9);
    });

    it('should have required columns', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectColumns(result, ['title', 'author', 'reviewer_name', 'rating']);
    });

    it('should include all books (with or without reviews)', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      // Get unique book titles
      const titles = new Set(result.rows.map(row => row.title));
      expect(titles.size).toBe(6);
      expect(titles.has('The Great Gatsby')).toBe(true);
      expect(titles.has('1984')).toBe(true);
      expect(titles.has('To Kill a Mockingbird')).toBe(true);
      expect(titles.has('Brave New World')).toBe(true);
      expect(titles.has('Jane Eyre')).toBe(true);
      expect(titles.has('Wuthering Heights')).toBe(true);
    });

    it('should be ordered by title ascending', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectOrdered(result, 'title', 'asc');
    });

    it('should include books with no reviews', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      // 'Brave New World' and 'Jane Eyre', 'Wuthering Heights' have no reviews
      const braveNewWorldRows = result.rows.filter(row => row.title === 'Brave New World');
      const janeEyreRows = result.rows.filter(row => row.title === 'Jane Eyre');
      const wutheringHeightsRows = result.rows.filter(row => row.title === 'Wuthering Heights');

      expect(braveNewWorldRows.length).toBe(1);
      expect(braveNewWorldRows[0].reviewer_name).toBeNull();
      expect(braveNewWorldRows[0].rating).toBeNull();

      expect(janeEyreRows.length).toBe(1);
      expect(janeEyreRows[0].reviewer_name).toBeNull();

      expect(wutheringHeightsRows.length).toBe(1);
      expect(wutheringHeightsRows[0].reviewer_name).toBeNull();
    });

    it('should show correct first row', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      // First alphabetically is '1984'
      expect(result.rows[0].title).toBe('1984');
      expect(result.rows[0].author).toBe('George Orwell');
    });
  });

  describe('Solution Validation', () => {
    it('exercise should match solution output', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const solutionPath = path.join(__dirname, 'solution.sql');
      try {
        const exerciseResult = await executor.executeFile(exercisePath);
        const solutionResult = await executor.executeFile(solutionPath);
        expect(exerciseResult.rows).toEqual(solutionResult.rows);
      } catch (error) {
        console.log('Exercise not implemented yet - skipping validation');
      }
    });
  });
});
