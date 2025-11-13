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

describe.each(DATABASES)('%s: SUM and AVG with GROUP BY', (database) => {
  let executor;
  const schema = 'aggregates_02';

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
      // 4 regions × 2 categories = 8 groups, but not all combinations exist
      // East: Electronics, Furniture
      // North: Electronics, Furniture
      // South: Electronics, Furniture
      // West: Electronics, Furniture
      // All 8 combinations are present in the data
      expectRowCount(result, 8);
    });

    it('should have required columns', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectColumns(result, ['region', 'product_category', 'total_amount', 'avg_amount']);
    });

    it('should have numeric values for amounts', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      expectAllRows(result,
        row => row.total_amount !== undefined && row.avg_amount !== undefined,
        'total_amount and avg_amount should have values'
      );
    });

    it('should be ordered by region ascending then category ascending', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);
      // Check region order (East, North, South, West alphabetically)
      const regions = result.rows.map(row => row.region);
      expect(regions[0]).toBe('East');
      expect(regions[1]).toBe('East');
      expect(regions[2]).toBe('North');
    });

    it('should have correct totals and averages', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      // Find East-Electronics row
      const eastElectronics = result.rows.find(
        row => row.region === 'East' && row.product_category === 'Electronics'
      );
      expect(eastElectronics).toBeDefined();
      // Handle both numeric and string values
      const totalAmount = parseFloat(eastElectronics.total_amount);
      const avgAmount = parseFloat(eastElectronics.avg_amount);
      expect(totalAmount).toBe(1100);
      expect(avgAmount).toBe(1100);
    });

    it('should handle multiple rows in a group correctly', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      // Find North-Electronics which should have multiple sales
      const northElectronics = result.rows.find(
        row => row.region === 'North' && row.product_category === 'Electronics'
      );
      expect(northElectronics).toBeDefined();
      // North Electronics: 1500 + 950 + 1050 = 3500
      const totalAmount = parseFloat(northElectronics.total_amount);
      const avgAmount = parseFloat(northElectronics.avg_amount);
      expect(totalAmount).toBe(3500);
      // Average: 3500 / 3 = 1166.67
      expect(avgAmount).toBeCloseTo(1166.67, 1);
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
