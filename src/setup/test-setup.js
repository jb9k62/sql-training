import { beforeAll, afterAll, afterEach } from 'vitest';
import { closePools } from '../db/postgres.js';
import { closeAll as closeSqlite } from '../db/sqlite.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Global cleanup after all tests
afterAll(async () => {
  await closePools();
  closeSqlite();
});

// Set test environment flag
process.env.NODE_ENV = 'test';

// Add custom matchers if needed
// expect.extend({
//   toHaveRowCount(received, expected) {
//     const pass = received.rowCount === expected;
//     return {
//       pass,
//       message: () =>
//         `Expected ${expected} rows but got ${received.rowCount}`
//     };
//   }
// });