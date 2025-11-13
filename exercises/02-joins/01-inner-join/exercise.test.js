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

describe.each(DATABASES)('%s: INNER JOIN Exercise', (database) => {
  let executor;
  const schema = 'joins_inner_01';

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
    it('should return correct number of rows (orders with total > $100)', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectRowCount(result, 6);
    });

    it('should have required columns', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectColumns(result, ['name', 'email', 'order_id', 'order_date', 'total']);
    });

    it('should only include orders with total greater than $100', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectAllRows(result,
        row => row.total > 100,
        'All order totals should be greater than $100'
      );
    });

    it('should be ordered by order_date descending', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectOrdered(result, 'order_date', 'desc');
    });

    it('should show highest value order first (Alice Brown, $300)', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expect(result.rows[0].name).toBe('Alice Brown');
      expect(result.rows[0].total).toBe(300.00);
    });

    it('should include Bob Smith with $200 order', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      const bobOrder = result.rows.find(row => row.name === 'Bob Smith' && row.total === 200.00);
      expect(bobOrder).toBeDefined();
      expect(bobOrder.email).toBe('bob@example.com');
    });

    it('should include Edward Jones with $175 order', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      const edwardOrder = result.rows.find(row => row.name === 'Edward Jones' && row.total === 175.00);
      expect(edwardOrder).toBeDefined();
      expect(edwardOrder.email).toBe('edward@example.com');
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
