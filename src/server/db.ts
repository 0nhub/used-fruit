import { Pool, type PoolClient, type QueryResultRow } from "pg";

const globalDatabase = globalThis as typeof globalThis & { usedFruitPool?: Pool };

export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return globalDatabase.usedFruitPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    statement_timeout: 15000,
    application_name: "used-fruit",
  });
}

export type Transaction = PoolClient;
export async function transaction<T>(work: (client: Transaction) => Promise<T>): Promise<T> {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const value = await work(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export async function rows<T extends QueryResultRow>(sql: string, values: unknown[] = []) {
  return (await database().query<T>(sql, values)).rows;
}
