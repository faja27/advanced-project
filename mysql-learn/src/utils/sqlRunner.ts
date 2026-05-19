import type { QueryResult, DatabaseType } from '../types';
import { databases } from '../data/databases';

let SQL: import('sql.js').SqlJsStatic | null = null;

async function getSQL() {
  if (!SQL) {
    const initSqlJs = (await import('sql.js')).default;
    SQL = await initSqlJs({
      locateFile: (file: string) => `/${file}`,
    });
  }
  return SQL;
}

/** Pre-load sql.js WebAssembly. Call on component mount to warm up. */
export async function warmupSQL(): Promise<void> {
  await getSQL();
}

const dbCache = new Map<string, import('sql.js').Database>();

export async function getDatabase(dbName: string, seedSQL: string): Promise<import('sql.js').Database> {
  if (dbCache.has(dbName)) {
    return dbCache.get(dbName)!;
  }
  const sql = await getSQL();
  const db = new sql.Database();
  db.run(seedSQL);
  dbCache.set(dbName, db);
  return db;
}

export function resetDatabase(dbName: string): void {
  dbCache.delete(dbName);
}

// ─── Query Safety ──────────────────────────────────────────────────────────

const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\bDROP\s+DATABASE\b/i, message: 'Query ini tidak diizinkan di editor pembelajaran' },
  { pattern: /\bTRUNCATE\s+TABLE\b/i, message: 'Query ini tidak diizinkan di editor pembelajaran' },
  { pattern: /\bDROP\s+TABLE\b/i, message: 'Perintah DROP TABLE tidak diizinkan di sandbox. Reload halaman untuk reset database.' },
  { pattern: /DELETE\s+FROM\s+\w+\s*;/i, message: 'Perintah DELETE FROM tanpa WHERE tidak diizinkan di sandbox. Tambahkan kondisi WHERE untuk membatasi baris yang dihapus.' },
  { pattern: /UPDATE\s+\w+\s+SET\b(?![^;]*\bWHERE\b)[^;]*;/i, message: 'Perintah UPDATE tanpa WHERE tidak diizinkan di sandbox. Tambahkan kondisi WHERE untuk membatasi baris yang diperbarui.' },
  { pattern: /ALTER\s+TABLE\s+\w+.*\bDROP\s+COLUMN\b/i, message: 'Perintah ALTER TABLE DROP COLUMN tidak diizinkan di sandbox.' },
];

function sanitizeQuery(query: string): string | null {
  for (const { pattern, message } of FORBIDDEN_PATTERNS) {
    if (pattern.test(query)) {
      return message;
    }
  }
  return null;
}

function injectAutoLimit(query: string): { query: string; wasLimitAdded: boolean } {
  const isSelect = /^\s*SELECT\b/i.test(query);
  if (!isSelect) return { query, wasLimitAdded: false };
  const hasLimit = /\bLIMIT\s+\d+/i.test(query);
  if (hasLimit) return { query, wasLimitAdded: false };
  const stripped = query.replace(/;\s*$/, '');
  return { query: `${stripped} LIMIT 100`, wasLimitAdded: true };
}

// ─── Public runQuery ───────────────────────────────────────────────────────

export async function runQuery(dbName: string, seedSQL: string, query: string): Promise<QueryResult> {
  const TIMEOUT_MS = 5000;

  const forbidden = sanitizeQuery(query);
  if (forbidden) {
    return { columns: [], rows: [], error: forbidden, resultType: 'blocked' };
  }

  const { query: finalQuery, wasLimitAdded } = injectAutoLimit(query.trim());

  const executePromise = (async (): Promise<QueryResult> => {
    try {
      const db = await getDatabase(dbName, seedSQL);
      const results = db.exec(finalQuery);

      if (results.length === 0) {
        const lower = finalQuery.trim().toLowerCase();
        if (lower.startsWith('insert') || lower.startsWith('update') || lower.startsWith('delete')) {
          const affected = db.getRowsModified();
          return { columns: [], rows: [], rowsAffected: affected, resultType: 'dml_success', wasLimitAdded: false };
        }
        if (lower.startsWith('create') || lower.startsWith('drop') || lower.startsWith('alter')) {
          return { columns: [], rows: [], resultType: 'empty', wasLimitAdded: false };
        }
        return { columns: [], rows: [], resultType: 'empty', wasLimitAdded };
      }

      const { columns, values } = results[0];
      return {
        columns: columns as string[],
        rows: values as (string | number | null)[][],
        wasLimitAdded,
        resultType: 'rows',
      };
    } catch (err) {
      return { columns: [], rows: [], error: (err as Error).message, resultType: 'error' };
    }
  })();

  const timeoutPromise = new Promise<QueryResult>((resolve) =>
    setTimeout(
      () =>
        resolve({
          columns: [],
          rows: [],
          error:
            'Query timeout: eksekusi melebihi 5 detik.\nCoba tambahkan WHERE atau LIMIT untuk mempercepat.',
          resultType: 'timeout',
        }),
      TIMEOUT_MS,
    ),
  );

  return Promise.race([executePromise, timeoutPromise]);
}

// ─── Write Query Validation ────────────────────────────────────────────────

export interface WriteQueryValidationResult {
  isCorrect: boolean;
  userResult: QueryResult | null;
  expectedResult: QueryResult | null;
  /** 'empty' | 'timeout' | 'expected_error' | SQL error message */
  error?: string;
}

async function runQueryIsolated(seedSQL: string, query: string): Promise<QueryResult> {
  const sql = await getSQL();
  const db = new sql.Database();
  try {
    db.run(seedSQL);
    const results = db.exec(query);
    if (results.length === 0) {
      const lower = query.trim().toLowerCase();
      if (lower.startsWith('insert') || lower.startsWith('update') || lower.startsWith('delete')) {
        const affected = db.getRowsModified();
        return { columns: ['affected_rows'], rows: [[affected]] };
      }
      if (lower.startsWith('create') || lower.startsWith('alter') || lower.startsWith('drop')) {
        return { columns: ['status'], rows: [['OK']] };
      }
      return { columns: [], rows: [] };
    }
    const { columns, values } = results[0];
    return { columns: columns as string[], rows: values as (string | number | null)[][] };
  } catch (err) {
    return { columns: [], rows: [], error: (err as Error).message };
  } finally {
    db.close();
  }
}

function normalizeSQL(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function compareResults(user: QueryResult, expected: QueryResult): boolean {
  if (expected.columns.length === 0 && user.columns.length === 0) return true;
  if (user.columns.length !== expected.columns.length) return false;
  if (user.rows.length !== expected.rows.length) return false;
  for (let r = 0; r < user.rows.length; r++) {
    for (let c = 0; c < user.columns.length; c++) {
      const u = user.rows[r][c];
      const e = expected.rows[r][c];
      if (u === null && e === null) continue;
      if (u === null || e === null) return false;
      if (String(u).toLowerCase() !== String(e).toLowerCase()) return false;
    }
  }
  return true;
}

export async function validateWriteQuery(
  userQuery: string,
  expectedQuery: string,
  dbType: DatabaseType,
): Promise<WriteQueryValidationResult> {
  if (!userQuery.trim()) {
    return { isCorrect: false, userResult: null, expectedResult: null, error: 'empty' };
  }

  const seedSQL = databases[dbType];

  let timeoutHandle: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<WriteQueryValidationResult>((resolve) => {
    timeoutHandle = setTimeout(
      () => resolve({ isCorrect: false, userResult: null, expectedResult: null, error: 'timeout' }),
      5000,
    );
  });

  const validatePromise = (async (): Promise<WriteQueryValidationResult> => {
    let expectedResult: QueryResult;
    try {
      expectedResult = await runQueryIsolated(seedSQL, expectedQuery);
      if (expectedResult.error) throw new Error(expectedResult.error);
    } catch {
      console.warn('[validateWriteQuery] Expected query failed in sandbox — fallback to text match');
      return {
        isCorrect: normalizeSQL(userQuery) === normalizeSQL(expectedQuery),
        userResult: null,
        expectedResult: null,
        error: 'expected_error',
      };
    }

    let userResult: QueryResult;
    try {
      userResult = await runQueryIsolated(seedSQL, userQuery);
      if (userResult.error) {
        return { isCorrect: false, userResult, expectedResult, error: userResult.error };
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { isCorrect: false, userResult: null, expectedResult, error: msg };
    }

    return { isCorrect: compareResults(userResult, expectedResult), userResult, expectedResult };
  })();

  try {
    const result = await Promise.race([validatePromise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch {
    return { isCorrect: false, userResult: null, expectedResult: null, error: 'Validation failed' };
  }
}
