import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Cache open databases
const databases = new Map();

export function getDatabase(name = 'default') {
  if (!databases.has(name)) {
    const dbPath = name === ':memory:'
      ? ':memory:'
      : path.join(process.cwd(), 'data', `${name}.db`);

    // Ensure data directory exists
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const db = new Database(dbPath);
    databases.set(name, db);
  }
  return databases.get(name);
}

// Execute query with optional parameters
// Supports both positional (?) and named (:name) parameters
export function query(sql, params = [], dbName = 'default') {
  const db = getDatabase(dbName);
  const stmt = db.prepare(sql);

  // Determine operation type
  const operation = sql.trim().toUpperCase().split(' ')[0];

  switch (operation) {
    case 'SELECT':
      // Handle both array params and object params for named parameters
      if (Array.isArray(params)) {
        return params.length ? stmt.all(...params) : stmt.all();
      } else {
        return stmt.all(params); // Named parameters as object
      }

    case 'INSERT':
    case 'UPDATE':
    case 'DELETE':
      let result;
      if (Array.isArray(params)) {
        result = params.length ? stmt.run(...params) : stmt.run();
      } else {
        result = stmt.run(params); // Named parameters as object
      }
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };

    default:
      // For CREATE, DROP, etc.
      return stmt.run();
  }
}

// Execute multiple statements (for seeding)
export function executeMultiple(sql, dbName = 'default') {
  const db = getDatabase(dbName);

  // Split statements by semicolon (accounting for strings)
  const statements = sql
    .split(/;\s*$/gm)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  const results = [];
  for (const statement of statements) {
    try {
      const stmt = db.prepare(statement);
      const result = stmt.run();
      results.push(result);
    } catch (error) {
      // Log error but continue with other statements
      console.error(`Error executing statement: ${error.message}`);
      results.push({ error: error.message });
    }
  }

  return results;
}

// Create a new in-memory database for testing
export function createTestDatabase(name = ':memory:') {
  if (databases.has(name)) {
    databases.get(name).close();
    databases.delete(name);
  }
  return getDatabase(name);
}

export function closeDatabase(name) {
  if (databases.has(name)) {
    databases.get(name).close();
    databases.delete(name);
  }
}

export function closeAll() {
  for (const [name, db] of databases.entries()) {
    db.close();
    databases.delete(name);
  }
}

// Export Database class for direct use if needed
export { Database };