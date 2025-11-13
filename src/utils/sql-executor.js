import fs from 'fs/promises';
import path from 'path';
import { queryPg96, queryPg13 } from '../db/postgres.js';
import { query as querySqlite, getDatabase, executeMultiple } from '../db/sqlite.js';

export class SqlExecutor {
  constructor(database = 'pg13', schema = 'public') {
    this.database = database;
    this.schema = schema;
  }

  async executeFile(filePath) {
    const sql = await fs.readFile(filePath, 'utf-8');
    return this.execute(sql);
  }

  async execute(sql) {
    const startTime = Date.now();

    try {
      let result;

      switch (this.database) {
        case 'pg96':
          result = await queryPg96(sql, [], this.schema);
          return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields?.map(f => f.name) || [],
            executionTime: Date.now() - startTime
          };

        case 'pg13':
          result = await queryPg13(sql, [], this.schema);
          return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields?.map(f => f.name) || [],
            executionTime: Date.now() - startTime
          };

        case 'sqlite':
          // SQLite returns array directly for SELECT
          result = querySqlite(sql, [], this.schema);
          const rows = Array.isArray(result) ? result : [];
          return {
            rows,
            rowCount: rows.length,
            fields: rows.length > 0 ? Object.keys(rows[0]) : [],
            executionTime: Date.now() - startTime
          };

        default:
          throw new Error(`Unknown database: ${this.database}`);
      }
    } catch (error) {
      throw new Error(`SQL execution failed: ${error.message}\nSQL: ${sql.substring(0, 200)}`);
    }
  }

  // Execute parameterized query (recommended for user input)
  async executeWithParams(sql, params = []) {
    const startTime = Date.now();

    try {
      let result;

      switch (this.database) {
        case 'pg96':
          result = await queryPg96(sql, params, this.schema);
          return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields?.map(f => f.name) || [],
            executionTime: Date.now() - startTime
          };

        case 'pg13':
          result = await queryPg13(sql, params, this.schema);
          return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields?.map(f => f.name) || [],
            executionTime: Date.now() - startTime
          };

        case 'sqlite':
          const rows = querySqlite(sql, params, this.schema);
          return {
            rows: Array.isArray(rows) ? rows : [],
            rowCount: Array.isArray(rows) ? rows.length : 0,
            fields: Array.isArray(rows) && rows.length > 0 ? Object.keys(rows[0]) : [],
            executionTime: Date.now() - startTime
          };

        default:
          throw new Error(`Unknown database: ${this.database}`);
      }
    } catch (error) {
      throw new Error(`Parameterized query failed: ${error.message}`);
    }
  }

  async seed(seedPath) {
    const sql = await fs.readFile(seedPath, 'utf-8');

    if (this.database === 'sqlite') {
      // Use the executeMultiple function for SQLite
      const results = executeMultiple(sql, this.schema);
      return results;
    } else {
      // For PostgreSQL, remove comment-only lines first, then split by semicolon
      const cleanedSql = sql
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 0 && !trimmed.startsWith('--');
        })
        .join('\n');

      const statements = cleanedSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const results = [];
      for (const statement of statements) {
        try {
          const result = await this.execute(statement + ';');
          results.push(result);
        } catch (error) {
          // For schema/table creation, we may not get rows back
          if (error.message.includes('CREATE') ||
            error.message.includes('DROP') ||
            error.message.includes('SET')) {
            results.push({ success: true });
          } else {
            console.error(`Error executing seed statement: ${error.message}`);
            throw error;
          }
        }
      }
      return results;
    }
  }

  // Helper method to create schema (PostgreSQL only)
  async createSchema(schemaName) {
    if (this.database.startsWith('pg')) {
      await this.execute(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
      this.schema = schemaName;
    }
  }

  // Helper method to drop schema (PostgreSQL only)
  async dropSchema(schemaName) {
    if (this.database.startsWith('pg')) {
      await this.execute(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    }
  }

  // Helper method to set search path (PostgreSQL only)
  async setSearchPath(schema) {
    if (this.database.startsWith('pg')) {
      await this.execute(`SET search_path TO ${schema}`);
      this.schema = schema;
    }
  }
}

// Factory function for creating executors with proper database selection
export function createExecutor(database = null, schema = 'public') {
  // Use environment variable if database not specified
  const db = database || process.env.DATABASE || 'pg13';
  return new SqlExecutor(db, schema);
}

// Export default instance for convenience
export default SqlExecutor;
