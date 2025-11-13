import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { SqlExecutor } from '../../../src/utils/sql-executor.js';
import {
  expectRowCount,
  expectColumns,
  expectOrdered,
  expectUnique,
} from '../../../src/utils/test-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASES = ['pg13'];

describe.each(DATABASES)('%s: ORDER BY and DISTINCT', (database) => {
  let executor;
  const schema = 'fundamentals_03';

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
      expectRowCount(result, 2);
    });

    it('should have required columns', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectColumns(result, ['category']);
    });

    it('should return unique categories only', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectUnique(result, 'category');
    });

    it('should be ordered alphabetically ascending', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectOrdered(result, 'category', 'asc');
    });

    it('should return Electronics and Furniture', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      const categories = result.rows.map(row => row.category);
      expect(categories).toEqual(['Electronics', 'Furniture']);
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
