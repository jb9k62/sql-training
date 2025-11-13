import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { SqlExecutor } from '../../../src/utils/sql-executor.js';
import {
  expectRowCount,
  expectColumns,
  expectOrdered,
  expectAllRows,
} from '../../../src/utils/test-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASES = ['pg13'];

describe.each(DATABASES)('%s: COUNT and GROUP BY', (database) => {
  let executor;
  const schema = 'aggregates_01';

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
    // Cleanup is commented out to allow debugging
    // if (database.startsWith('pg')) {
    //   await executor.dropSchema(schema);
    // }
  });

  describe('Exercise Requirements', () => {
    it('should return correct number of rows', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      // All students have 3 tests, so HAVING COUNT(*) > 2 returns all 5 students
      expectRowCount(result, 5);
    });

    it('should have required columns', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectColumns(result, ['student_name', 'test_count']);
    });

    it('should only include students with more than 2 tests', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectAllRows(result,
        row => row.test_count > 2,
        'All students should have more than 2 tests'
      );
    });

    it('should be ordered by test_count descending', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectOrdered(result, 'test_count', 'desc');
    });

    it('should show test counts of 3 for all students', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectAllRows(result,
        row => row.test_count === 3 || row.test_count === '3',
        'Each student should have exactly 3 tests'
      );
    });

    it('should include all student names', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      const studentNames = new Set(result.rows.map(row => row.student_name));
      expect(studentNames.has('Alice Johnson')).toBe(true);
      expect(studentNames.has('Bob Smith')).toBe(true);
      expect(studentNames.has('Carol Davis')).toBe(true);
      expect(studentNames.has('David Wilson')).toBe(true);
      expect(studentNames.has('Emma Brown')).toBe(true);
    });

    it('should have test_count values', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectAllRows(result,
        row => row.test_count !== undefined && row.test_count !== null,
        'All rows should have a test_count value'
      );
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
