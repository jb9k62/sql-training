import { expect } from 'vitest';

// Assert row count
export function expectRowCount(result, expected) {
  expect(result.rowCount, `Expected ${expected} rows but got ${result.rowCount}`).toBe(expected);
}

// Assert columns exist
export function expectColumns(result, expectedColumns) {
  const missing = expectedColumns.filter(col => !result.fields.includes(col));
  expect(missing, `Missing columns: ${missing.join(', ')}`).toHaveLength(0);
}

// Assert specific row contains data
export function expectRowContains(result, rowIndex, expectedData) {
  const row = result.rows[rowIndex];
  expect(row, `Row ${rowIndex} not found`).toBeDefined();

  for (const [key, value] of Object.entries(expectedData)) {
    expect(row[key], `Row ${rowIndex}: expected ${key}=${value} but got ${row[key]}`).toBe(value);
  }
}

// Assert column values are ordered
export function expectOrdered(result, column, order = 'asc') {
  const values = result.rows.map(r => r[column]);
  const sorted = [...values].sort((a, b) => {
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;

    if (order === 'asc') {
      return a < b ? -1 : a > b ? 1 : 0;
    } else {
      return a > b ? -1 : a < b ? 1 : 0;
    }
  });

  expect(values, `Column ${column} not sorted ${order}`).toEqual(sorted);
}

// Assert no null values in column
export function expectNoNulls(result, column) {
  const nullCount = result.rows.filter(r => r[column] === null || r[column] === undefined).length;
  expect(nullCount, `Found ${nullCount} null values in column ${column}`).toBe(0);
}

// Assert unique values in column
export function expectUnique(result, column) {
  const values = result.rows.map(r => r[column]);
  const unique = new Set(values);
  expect(unique.size, `Column ${column} has duplicate values`).toBe(values.length);
}

// Compare two results for equality
export function expectResultsEqual(actual, expected) {
  expect(actual.rowCount).toBe(expected.rowCount);
  expect(actual.fields.sort()).toEqual(expected.fields.sort());
  expect(actual.rows).toEqual(expected.rows);
}

// Assert that a column contains specific values
export function expectColumnValues(result, column, expectedValues) {
  const actualValues = result.rows.map(r => r[column]);
  expect(actualValues.sort()).toEqual(expectedValues.sort());
}

// Assert that rows match a predicate
export function expectAllRows(result, predicate, message) {
  const failingRows = result.rows.filter(row => !predicate(row));
  expect(failingRows, message || 'Some rows failed the predicate').toHaveLength(0);
}

// Assert aggregate values
export function expectAggregateValue(result, column, expectedValue) {
  expect(result.rows).toHaveLength(1);
  expect(result.rows[0][column]).toBe(expectedValue);
}

// Assert date is in range
export function expectDateInRange(result, column, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (const row of result.rows) {
    const date = new Date(row[column]);
    expect(date >= start && date <= end,
      `Date ${row[column]} is not between ${startDate} and ${endDate}`).toBe(true);
  }
}

// Assert execution time (performance testing)
export function expectPerformance(result, maxMilliseconds) {
  expect(result.executionTime,
    `Query took ${result.executionTime}ms, expected less than ${maxMilliseconds}ms`
  ).toBeLessThan(maxMilliseconds);
}

// Helper to create a test database connection for a specific database type
export async function withTestDatabase(database, schema, callback) {
  const { SqlExecutor } = await import('./sql-executor.js');
  const executor = new SqlExecutor(database, schema);

  try {
    // Create schema if PostgreSQL
    if (database.startsWith('pg')) {
      await executor.createSchema(schema);
    }

    // Run the callback with the executor
    await callback(executor);
  } finally {
    // Cleanup
    if (database.startsWith('pg')) {
      await executor.dropSchema(schema);
    }
  }
}

// Helper to load and compare solution files
export async function compareSolutions(executor, exercisePath, solutionPath) {
  const exerciseResult = await executor.executeFile(exercisePath);
  const solutionResult = await executor.executeFile(solutionPath);

  expectResultsEqual(exerciseResult, solutionResult);
}

// Export all helpers as default object too
export default {
  expectRowCount,
  expectColumns,
  expectRowContains,
  expectOrdered,
  expectNoNulls,
  expectUnique,
  expectResultsEqual,
  expectColumnValues,
  expectAllRows,
  expectAggregateValue,
  expectDateInRange,
  expectPerformance,
  withTestDatabase,
  compareSolutions
};