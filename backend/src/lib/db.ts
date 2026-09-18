import { Pool } from "postgres";

let pool: Pool | null = null;

export function initializeDb(connectionString: string): Pool {
  pool = new Pool(connectionString, {
    max: 20,
  });
  return pool;
}

export function getDb(): Pool {
  if (!pool) {
    throw new Error("Database not initialized. Call initializeDb first.");
  }
  return pool;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = await getDb().connect();
  try {
    const result = await client.queryArray(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results[0] || null;
}
