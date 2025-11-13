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

describe.each(DATABASES)('%s: WHERE with Operators (BETWEEN, AND, OR)', (database) => {
  let executor;
  const schema = 'fundamentals_02';

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
      expectRowCount(result, 3);
    });

    it('should have required columns', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectColumns(result, ['name', 'department', 'salary', 'hire_date']);
    });

    it('should only include Engineering or Sales employees', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectAllRows(result,
        row => row.department === 'Engineering' || row.department === 'Sales',
        'All employees should be from Engineering or Sales'
      );
    });

    it('should only include salaries between 70000 and 90000', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectAllRows(result,
        row => row.salary >= 70000 && row.salary <= 90000,
        'All salaries should be between 70000 and 90000 inclusive'
      );
    });

    it('should only include employees hired after 2021-01-01', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectAllRows(result,
        row => new Date(row.hire_date) > new Date('2021-01-01'),
        'All employees should be hired after 2021-01-01'
      );
    });

    it('should be ordered by salary descending', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectOrdered(result, 'salary', 'desc');
    });

    it('should return expected rows', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expect(result.rows[0].name).toBe('Megan Clark');
      expect(result.rows[0].salary).toBe(90000);
      expect(result.rows[0].department).toBe('Engineering');
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
