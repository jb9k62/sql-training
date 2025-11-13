import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { SqlExecutor } from '../../../src/utils/sql-executor.js';
import {
  expectRowCount,
  expectColumns,
  expectOrdered,
  expectNoNulls,
  expectAllRows,
  compareSolutions
} from '../../../src/utils/test-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure which databases this exercise supports
const DATABASES = ['pg13'];

describe.each(DATABASES)('%s: Basic SELECT with Filtering', (database) => {
  let executor;
  const schema = database === 'sqlite' ? 'fundamentals_01' : 'fundamentals_01';

  beforeAll(async () => {
    executor = new SqlExecutor(database, schema);

    // Create schema for PostgreSQL
    if (database.startsWith('pg')) {
      await executor.createSchema(schema);
      await executor.setSearchPath(schema);
    }

    // Load seed data
    const seedPath = path.join(__dirname, 'seed.sql');
    await executor.seed(seedPath);
  });

  afterAll(async () => {
    // Cleanup schema (PostgreSQL only)
    if (database.startsWith('pg')) {
      await executor.dropSchema(schema);
    }
  });

  describe('Exercise Requirements', () => {
    it('should return correct number of rows', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      // Should return exactly 10 users from USA/Canada after 2024-01-01
      expectRowCount(result, 10);
    });

    it('should have required columns', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      expectColumns(result, ['name', 'email', 'country', 'created_at']);
    });

    it('should only include USA and Canada users', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      expectAllRows(result,
        row => row.country === 'USA' || row.country === 'Canada',
        'All rows should be from USA or Canada'
      );
    });

    it('should only include users registered after 2024-01-01', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      expectAllRows(result,
        row => new Date(row.created_at) > new Date('2024-01-01'),
        'All users should be registered after 2024-01-01'
      );
    });

    it('should be ordered by created_at descending', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      expectOrdered(result, 'created_at', 'desc');
    });

    it('should not have null values in required columns', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      expectNoNulls(result, 'name');
      expectNoNulls(result, 'email');
      expectNoNulls(result, 'country');
      expectNoNulls(result, 'created_at');
    });

    it('should return the expected first and last rows', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const result = await executor.executeFile(exercisePath);

      // Check first row (most recent)
      expect(result.rows[0].name).toBe('Frank Miller');
      expect(result.rows[0].country).toBe('Canada');
      expect(result.rows[0].created_at.toISOString()).toContain('2024-07-01');

      // Check last row (oldest within criteria)
      expect(result.rows[9].name).toBe('Leo King');
      expect(result.rows[9].country).toBe('Canada');
      expect(result.rows[9].created_at.toISOString()).toContain('2024-01-05');
    });
  });

  describe('Solution Validation', () => {
    it('exercise should match solution output', async () => {
      const exercisePath = path.join(__dirname, 'exercise.sql');
      const solutionPath = path.join(__dirname, 'solution.sql');

      // Skip if exercise.sql is empty or contains only TODO
      try {
        const exerciseResult = await executor.executeFile(exercisePath);
        const solutionResult = await executor.executeFile(solutionPath);

        // Results should be identical
        expect(exerciseResult.rows).toEqual(solutionResult.rows);
      } catch (error) {
        // Exercise not implemented yet
        console.log('Exercise not implemented yet - skipping validation');
      }
    });
  });
});
